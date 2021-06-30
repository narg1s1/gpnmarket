import { ActivatedRoute } from "@angular/router";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { Request } from "../../../../../common/models/request";
import { delayWhen, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from "rxjs/operators";
import { Uuid } from "../../../../../../cart/models/uuid";
import { UxgBreadcrumbsService } from "uxg";
import { CommercialProposalState } from "../../../../states/commercial-proposal.state";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { CommercialProposalsActions } from "../../../../actions/commercial-proposal.actions";
import { RequestPosition } from "../../../../../common/models/request-position";
import { ToastActions } from "../../../../../../shared/actions/toast.actions";
import { RequestState } from "../../../../states/request.state";
import { RequestActions } from "../../../../actions/request.actions";
import { animate, style, transition, trigger } from "@angular/animations";
import { StateStatus } from "../../../../../common/models/state-status";
import { ProposalSource } from "../../../../enum/proposal-source";
import { Procedure } from "../../../../models/procedure";
import { Title } from "@angular/platform-browser";
import { CommonProposal, CommonProposalByPosition, CommonProposalItem } from "../../../../../common/models/common-proposal";
import { CommercialProposalGroupService } from "../../../../services/commercial-proposal-group.service";
import { ProposalsView } from "../../../../../../shared/models/proposals-view";
import { AppComponent } from "../../../../../../app.component";
import Update = CommercialProposalsActions.Update;
import Fetch = CommercialProposalsActions.Fetch;
import DownloadTemplate = CommercialProposalsActions.DownloadTemplate;
import UploadTemplate = CommercialProposalsActions.UploadTemplate;
import Publish = CommercialProposalsActions.Publish;
import DownloadAnalyticalReport = CommercialProposalsActions.DownloadAnalyticalReport;
import FetchAvailablePositions = CommercialProposalsActions.FetchAvailablePositions;
import RefreshProcedures = CommercialProposalsActions.RefreshProcedures;
import Rollback = CommercialProposalsActions.Rollback;
import UpdateItems = CommercialProposalsActions.UpdateItems;
import Create = CommercialProposalsActions.Create;
import { CommercialProposalsService } from "../../../../services/commercial-proposals.service";
import { PositionStatus } from "../../../../../common/enum/position-status";
import moment from "moment";

@Component({
  templateUrl: 'commercial-proposal-view.component.html',
  styleUrls: ['commercial-proposal-view.component.scss'],
  animations: [trigger('sidebarHide', [
    transition(':leave', animate('300ms ease', style({ 'max-width': '0', 'margin-left': '0' }))),
  ])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommercialProposalViewComponent implements OnInit, OnDestroy {
  @Select(CommercialProposalState.proposals) proposals$: Observable<CommonProposal[]>;
  @Select(CommercialProposalState.proposalsByPositions) proposalsByPositions$: Observable<CommonProposalByPosition[]>;
  @Select(CommercialProposalState.positions) positions$: Observable<RequestPosition[]>;
  @Select(CommercialProposalState.availablePositions) availablePositions$: Observable<RequestPosition[]>;
  @Select(CommercialProposalState.procedures) procedures$: Observable<Procedure[]>;
  @Select(CommercialProposalState.status) status$: Observable<StateStatus>;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.status) requestStatus$: Observable<StateStatus>;

  groupId: Uuid;

  readonly destroy$ = new Subject();
  readonly procedurePositionsSelected$ = new Subject<Uuid[]>();
  readonly contragentsWithTp$ = this.procedurePositionsSelected$.pipe(
    withLatestFrom(this.route.params),
    switchMap(([ids, { id }]) => this.service.getContragentsWithTp(id, ids))
  );
  readonly procedureSource = ProposalSource.COMMERCIAL_PROPOSAL;
  readonly downloadTemplate = (requestId: Uuid, groupId: Uuid) => new DownloadTemplate(requestId, groupId);
  readonly uploadTemplate = (requestId: Uuid, groupId: Uuid, files: File[]) => new UploadTemplate(requestId, files, groupId);
  readonly downloadAnalyticalReport = (requestId: Uuid, groupId: Uuid) => new DownloadAnalyticalReport(requestId, groupId);
  readonly publishPositions = (requestId: Uuid, groupId: Uuid, proposalPositions: CommonProposalByPosition[]) => new Publish(requestId, groupId, proposalPositions);
  readonly updateProcedures = (requestId: Uuid, groupId: Uuid) => [new RefreshProcedures(requestId, groupId), new FetchAvailablePositions(requestId, groupId)];
  readonly rollback = (requestId: Uuid, groupId: Uuid, { id }: RequestPosition) => new Rollback(requestId, groupId, id);
  readonly create = (requestId: Uuid, groupId: Uuid, payload: Partial<CommonProposal>, items?: CommonProposalItem[]) => new Create(requestId, groupId, payload, items);
  readonly edit = (requestId: Uuid, groupId: Uuid, payload: Partial<CommonProposal> & { id: Uuid }, items?: CommonProposalItem[]) => new Update(requestId, groupId, payload, items);
  readonly canRollback = ({ status, statusChangedDate }: RequestPosition, rollbackDuration: number) => status === PositionStatus.RESULTS_AGREEMENT &&
    moment().diff(moment(statusChangedDate), 'seconds') < rollbackDuration

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    public store: Store,
    public title: Title,
    public app: AppComponent,
    public groupService: CommercialProposalGroupService,
    public service: CommercialProposalsService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      tap(({ groupId }) => this.groupId = groupId),
      tap(({id, groupId}) => this.store.dispatch([new Fetch(id, groupId), new FetchAvailablePositions(id, groupId)])),
      delayWhen(({ id, groupId }) => this.groupService.info(id, groupId).pipe(tap(
        ({ name }) => this.title.setTitle(name)
      ))),
      delayWhen(({id}) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([{ groupId }, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/backoffice" },
        { label: `Заявка №${number}`, link: `/requests/backoffice/${id}` },
        { label: 'Согласование КП', link: `/requests/backoffice/${id}/commercial-proposals`},
        { label: 'Страница предложений', link: `/requests/backoffice/${id}/commercial-proposals/${groupId}` }
      ]),
      takeUntil(this.destroy$)
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(Create, Update, UploadTemplate),
      throttleTime(1),
      takeUntil(this.destroy$)
    ).subscribe(({ result }) => {
      const e = result.error as any;
      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) :
        new ToastActions.Success(`КП успешно сохранено`));
    });

    this.switchView("grid");
  }

  saveProposalItem(item: Partial<CommonProposalItem>, proposal: CommonProposal) {
    const items: Partial<CommonProposalItem>[] = [...proposal?.items.filter(({ status }) => ['NEW', 'SENT_TO_EDIT'].includes(status)) ?? []];
    const i = items?.findIndex(({ id }) => item.id === id);
    i >= 0 ? items[i] = item : items.push(item);

    item.deliveryDate = item.deliveryDate.replace(/(\d{2}).(\d{2}).(\d{4})/, '$3-$2-$1');
    this.store.dispatch(new UpdateItems(proposal.id, items));
  }

  switchView(view: ProposalsView) {
    this.app.noHeaderStick = this.app.noContentPadding = view !== "list";
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
