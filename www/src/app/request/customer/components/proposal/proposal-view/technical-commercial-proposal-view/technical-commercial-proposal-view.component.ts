import { OffersApproveGroupModel } from './../../../../../../procedure/models/offers-approve-group.model';
import { ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { Request } from "../../../../../common/models/request";
import { delayWhen, switchMap, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { Uuid } from "../../../../../../cart/models/uuid";
import { UxgBreadcrumbsService } from "uxg";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { StateStatus } from "../../../../../common/models/state-status";
import { ToastActions } from "../../../../../../shared/actions/toast.actions";
import { PluralizePipe } from "../../../../../../shared/pipes/pluralize-pipe";
import { RequestState } from "../../../../states/request.state";
import { RequestActions } from "../../../../actions/request.actions";
import { AppComponent } from "../../../../../../app.component";
import { ProposalsView } from "../../../../../../shared/models/proposals-view";
import { Title } from "@angular/platform-browser";
import { CommonProposal, CommonProposalByPosition, CommonProposalItem } from "../../../../../common/models/common-proposal";
import { TechnicalCommercialProposals } from "../../../../actions/technical-commercial-proposal.actions";
import { TechnicalCommercialProposalService } from "../../../../services/technical-commercial-proposal.service";
import { TechnicalCommercialProposalState } from "../../../../states/technical-commercial-proposal.state";
import { RequestPosition } from "../../../../../common/models/request-position";
import Review = TechnicalCommercialProposals.Review;
import DownloadAnalyticalReport = TechnicalCommercialProposals.DownloadAnalyticalReport;
import { ProposalSource } from "../../../../../back-office/enum/proposal-source";
import {Location} from '@angular/common';
@Component({
  templateUrl: './technical-commercial-proposal-view.component.html',
  providers: [PluralizePipe]
})
export class TechnicalCommercialProposalViewComponent implements OnInit, OnDestroy {
  @Select(RequestState.request) readonly request$: Observable<Request>;
  @Select(TechnicalCommercialProposalState.proposalsByPos(['NEW', 'SENT_TO_REVIEW']))
  readonly proposalsByPosSentToReview$: Observable<CommonProposalByPosition[]>;
  @Select(TechnicalCommercialProposalState.proposalsByPos(['APPROVED', 'REJECTED']))
  readonly proposalsByPosReviewed$: Observable<CommonProposalByPosition[]>;
  @Select(TechnicalCommercialProposalState.proposalsByPos(['SENT_TO_EDIT']))
  readonly proposalsByPosSendToEdit$: Observable<CommonProposalByPosition[]>;
  @Select(TechnicalCommercialProposalState.proposals)
  readonly proposals$: Observable<CommonProposal[]>;
  @Select(TechnicalCommercialProposalState.proposalsByStatus(['NEW', 'SENT_TO_REVIEW']))
  readonly proposalsSentToReview$: Observable<CommonProposal[]>;
  @Select(TechnicalCommercialProposalState.proposalsByStatus(['APPROVED']))
  readonly proposalsReviewed$: Observable<CommonProposal[]>;
  @Select(TechnicalCommercialProposalState.proposalsByStatus(['SENT_TO_EDIT']))
  readonly proposalsSendToEdit$: Observable<CommonProposal[]>;
  @Select(TechnicalCommercialProposalState.positions)
  readonly positions$: Observable<RequestPosition[]>;
  @Select(TechnicalCommercialProposalState.status)
  readonly stateStatus$: Observable<StateStatus>;
  @Select(TechnicalCommercialProposalState.offersApproveGroup) offersApproveGroup$: Observable<OffersApproveGroupModel>;
  @Select(TechnicalCommercialProposalState.isCanApprove) isCanApprove$: Observable<boolean>;


  groupId: Uuid;
  requestId: Uuid;
  view: ProposalsView = "grid";
  tradingScheme: 'TRADE' | 'AGENT';
  readonly destroy$ = new Subject();
  readonly source = ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL;
  readonly review = (proposalItems: CommonProposalItem[], positions: RequestPosition[], offersApproveGroupId: Uuid, sendToEditComment?: string) => {
    return new Review(proposalItems, positions, offersApproveGroupId, sendToEditComment);
  }
  readonly downloadAnalyticalReport = (requestId: Uuid, groupId: Uuid) => new DownloadAnalyticalReport(requestId, groupId);

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    private pluralize: PluralizePipe,
    private cd: ChangeDetectorRef,
    private app: AppComponent,
    private title: Title,
    public store: Store,
    public service: TechnicalCommercialProposalService,
    private _location: Location
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      tap(({ groupId, id }) => {
        this.requestId = id;
        this.groupId = groupId;
      }),
      delayWhen(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([{ groupId }, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${ number }`, link: `/requests/customer/${ id }` },
        { label: 'Согласование ТКП', link: `/requests/customer/${ id }/offers-approve-groups` },
        { label: 'Страница предложений', link: `/requests/customer/${ id }/offers-approve-groups/${ groupId }` }
      ]),
      switchMap(([{ id, groupId }]) => this.store.dispatch(new TechnicalCommercialProposals.Fetch(id, groupId))),
    ).subscribe(data => {
      this.tradingScheme = data.CustomerTechnicalCommercialProposals?.offersApproveGroup?.scheme;
      this.cd.detectChanges();
    });

    this.actions.pipe(
      ofActionCompleted(Review),
      tap(({ result, action }) => {
        const e = result.error as any;
        const length = (action?.proposalItems?.filter(prop => !!prop).length || 0) + (action?.positions?.filter(prop => !!prop).length || 0) || null;
        const text = `По ${length ? this.pluralize.transform(length, "позиции", "позициям", "позициям") : 'всем позициям'} принято решение`;

        this.store.dispatch(e ? new ToastActions.Error(e && e.error?.detail) : new ToastActions.Success(text));
      }),
      takeUntil(this.destroy$),
    ).subscribe(_ => {
      this.store.dispatch(new TechnicalCommercialProposals.Fetch(this.requestId, this.groupId))
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cd.detectChanges();
        });
    });

    this.switchView(this.view);
  }

  switchView(view: ProposalsView) {
    this.view = view;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
