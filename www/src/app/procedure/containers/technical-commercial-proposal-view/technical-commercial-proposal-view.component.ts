import { ProcedureProposalViewComponent } from './../../components/proposal-view/procedure-proposal-view.component';
import {ActivatedRoute, Router} from "@angular/router";
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {
  takeUntil,
  tap,
  first,
  filter,
  switchMap, throttleTime
} from "rxjs/operators";
import { Uuid } from "../../../cart/models/uuid";
import { UxgBreadcrumbsService } from "uxg";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { RequestPosition } from "../../../request/common/models/request-position";
import { animate, style, transition, trigger } from "@angular/animations";
import { StateStatus } from "../../../request/common/models/state-status";
import { ProposalSource } from "../../../request/back-office/enum/proposal-source";
import { Procedure } from "../../../request/back-office/models/procedure";
import {
  CommonProposal,
  CommonProposalByPosition,
  CommonProposalItem
} from "../../../request/common/models/common-proposal";
import { AppComponent } from "../../../app.component";
import { ProcedureActions } from "../../actions/procedure.actions";
import { ProcedureState } from "../../states/procedure.state";
import { ToastActions } from "../../../shared/actions/toast.actions";
import { OffersApproveGroupModel } from "../../models/offers-approve-group.model";

import FetchProposals = ProcedureActions.FetchProposals;
import FetchProcedure = ProcedureActions.FetchProcedure;
import CreateProposal = ProcedureActions.CreateProposal;
import UpdateProposal = ProcedureActions.UpdateProposal;
import DownloadTemplate = ProcedureActions.DownloadTemplate;
import UploadTemplate = ProcedureActions.UploadTemplate;
import UpdateItems = ProcedureActions.UpdateItems;
import Publish = ProcedureActions.Publish;

@Component({
  templateUrl: './technical-commercial-proposal-view.component.html',
  styleUrls: ['./technical-commercial-proposal-view.component.scss'],
  animations: [trigger('sidebarHide', [
    transition(':leave', animate('300ms ease', style({ 'max-width': '0', 'margin-left': '0' }))),
  ])],
})
export class TechnicalCommercialProposalViewComponent implements OnInit, OnDestroy {

  @ViewChild('procedureProposalViewComponent') procedureProposalViewComponent: ProcedureProposalViewComponent;

  @Select(ProcedureState.proposalsByPositions) proposalsByPositions$: Observable<CommonProposalByPosition[]>;
  @Select(ProcedureState.proposals) proposals$: Observable<CommonProposal[]>;
  @Select(ProcedureState.positions) positions$: Observable<RequestPosition[]>;
  @Select(ProcedureState.status) status$: Observable<StateStatus>;
  @Select(ProcedureState.procedure) procedure$: Observable<Procedure>;
  @Select(ProcedureState.offersApproveGroup) offersApproveGroup$: Observable<OffersApproveGroupModel>;
  @Select(ProcedureState.isCanApprove) isCanApprove$: Observable<boolean>;

  groupId: Uuid;
  proposalGroupId: string;
  procedureUid: string;
  procedureId: number;

  readonly destroy$ = new Subject();
  readonly procedureSource = ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL;

  // TODO: Обработчики событий -  нужно оживить
  readonly downloadTemplate = (groupId: Uuid) => new DownloadTemplate(groupId);
  readonly uploadTemplate = (groupId: Uuid, files: File[]) => new UploadTemplate(files, groupId);
  // readonly downloadAnalyticalReport = (requestId: Uuid, groupId: Uuid) => new DownloadAnalyticalReport(requestId, groupId);
  readonly publishPositions = (groupId: Uuid, proposals: CommonProposalItem[], filters?: any) => new Publish(groupId, proposals, filters);
  // readonly updateProcedures = (requestId: Uuid, groupId: Uuid) => [new RefreshProcedures(requestId, groupId), new FetchAvailablePositions(requestId, groupId)];
  // readonly fetchProcedureCreationPositions = (requestId: Uuid, groupId: Uuid, query?: string, payload?: RequestFilters) => new FetchProcedureCreationPositions(requestId, groupId, query, payload);
  // readonly rollback = (requestId: Uuid, groupId: Uuid, { id }: RequestPosition) => new Rollback(requestId, groupId, id);
  readonly create = (groupId: Uuid, payload: Partial<CommonProposal>, items?: CommonProposalItem[]) => new CreateProposal(groupId, payload, items);
  readonly edit = (groupId: Uuid, payload: Partial<CommonProposal> & { id: Uuid }, items?: CommonProposalItem[]) => new UpdateProposal(groupId, payload, items);
  // readonly canRollback = ({ status, statusChangedDate }: RequestPosition, rollbackDuration: number) => status === PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT &&
  //   moment().diff(moment(statusChangedDate), 'seconds') < rollbackDuration

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    public store: Store,
    public app: AppComponent,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      tap((params: any) => {
        this.procedureUid = params.procedureUid;
      }),
      filter((params: any) => !!this.procedureUid),
      first(),
      switchMap((params: any) => {
        return this.store.selectOnce(ProcedureState.procedure);
      }),
      filter((procedure: Procedure) => !procedure),
      switchMap((procedure: Procedure) => {
        return this.store.dispatch(new FetchProcedure(this.procedureUid));
    }),
      takeUntil(this.destroy$)
    )
    .subscribe(_ => {
      this.cdr.detectChanges();
    });

    this.route.params.pipe(
      tap((data) => {
        this.groupId = data.id;
        this.proposalGroupId = data.groupId;
      }),
      switchMap(() => this.store.dispatch(
        this.proposalGroupId ?
        new FetchProposals(this.groupId, false, { offersApproveGroupId: this.proposalGroupId }) :
        new FetchProposals(this.groupId, true, { onlyWithoutOffersApproveGroups: true }))
      ),
      takeUntil(this.destroy$)
    ).subscribe(_ => {
      this.cdr.detectChanges();
    });

    this.actions.pipe(
      ofActionCompleted(CreateProposal, UpdateProposal, UploadTemplate, Publish),
      takeUntil(this.destroy$)
    ).subscribe(({ action, result }) => {
      const e = result.error as any;
      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) :
        new ToastActions.Success(action instanceof Publish ? `Отправлено на согласование` : `Предложение успешно сохранено`));
      this.cdr.detectChanges();
    });
  }

  saveProposalItem(item: Partial<CommonProposalItem>, proposal: CommonProposal) {
    const items: Partial<CommonProposalItem>[] = [...proposal?.items.filter(({ status }) => ['NEW', 'SENT_TO_EDIT'].includes(status)) ?? []];
    const i = items?.findIndex(({ id }) => item.id === id);
    i >= 0 ? items[i] = item : items.push(item);

    item.deliveryDate = item.deliveryDate.replace(/(\d{2}).(\d{2}).(\d{4})/, '$3-$2-$1');

    this.store.dispatch(new UpdateItems(proposal.id, items))
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.store.dispatch(
          this.proposalGroupId ?
          new FetchProposals(this.groupId, true, { offersApproveGroupId: this.proposalGroupId, ...this.procedureProposalViewComponent.filterForm.value }) :
          new FetchProposals(this.groupId, true, { onlyWithoutOffersApproveGroups: true, ...this.procedureProposalViewComponent.filterForm.value })
        ).pipe(takeUntil(this.destroy$)).subscribe();
      });
  }

  createProposal($event) {
    this.store.dispatch(
      this.create(this.groupId, $event.proposal, $event.items)
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(_ => {
      this.store.dispatch(
        this.proposalGroupId ?
        new FetchProposals(this.groupId, true, { offersApproveGroupId: this.proposalGroupId, ...this.procedureProposalViewComponent.filterForm.value }) :
        new FetchProposals(this.groupId, true, { onlyWithoutOffersApproveGroups: true, ...this.procedureProposalViewComponent.filterForm.value })
      ).pipe(takeUntil(this.destroy$)).subscribe();
    });
  }

  editProposal($event) {
    this.store.dispatch(
      this.edit(this.groupId, $event.proposal, $event.items)
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(_ => {
      this.store.dispatch(
        this.proposalGroupId ?
        new FetchProposals(this.groupId, true, { offersApproveGroupId: this.proposalGroupId, ...this.procedureProposalViewComponent.filterForm.value }) :
        new FetchProposals(this.groupId, true, { onlyWithoutOffersApproveGroups: true, ...this.procedureProposalViewComponent.filterForm.value })
      ).pipe(takeUntil(this.destroy$)).subscribe();
    });
  }

  onPublishProposals($event) {
    this.store.dispatch(this.publishPositions(this.groupId, $event.selectedPositionTCPs, $event.filterForm))
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.store.dispatch(
          this.proposalGroupId ?
          new FetchProposals(this.groupId, true, { offersApproveGroupId: this.proposalGroupId, ...this.procedureProposalViewComponent.filterForm.value }) :
          new FetchProposals(this.groupId, true, { onlyWithoutOffersApproveGroups: true, ...this.procedureProposalViewComponent.filterForm.value })
        ).pipe(takeUntil(this.destroy$)).subscribe();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
