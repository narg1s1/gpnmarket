import { ActivatedRoute } from "@angular/router";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { Request } from "../../../../../common/models/request";
import { delayWhen, takeUntil, tap, throttleTime, withLatestFrom } from "rxjs/operators";
import { Uuid } from "../../../../../../cart/models/uuid";
import { UxgBreadcrumbsService } from "uxg";
import { TechnicalCommercialProposalState } from "../../../../states/technical-commercial-proposal.state";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { TechnicalCommercialProposals } from "../../../../actions/technical-commercial-proposal.actions";
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
import { TechnicalCommercialProposalGroupService } from "../../../../services/technical-commercial-proposal-group.service";
import { ProposalsView } from "../../../../../../shared/models/proposals-view";
import { AppComponent } from "../../../../../../app.component";
import Update = TechnicalCommercialProposals.Update;
import Fetch = TechnicalCommercialProposals.Fetch;
import DownloadTemplate = TechnicalCommercialProposals.DownloadTemplate;
import UploadTemplate = TechnicalCommercialProposals.UploadTemplate;
import Publish = TechnicalCommercialProposals.Publish;
import DownloadAnalyticalReport = TechnicalCommercialProposals.DownloadAnalyticalReport;
import FetchAvailablePositions = TechnicalCommercialProposals.FetchAvailablePositions;
import RefreshProcedures = TechnicalCommercialProposals.RefreshProcedures;
import Rollback = TechnicalCommercialProposals.Rollback;
import UpdateItems = TechnicalCommercialProposals.UpdateItems;
import Create = TechnicalCommercialProposals.Create;
import { PositionStatus } from "../../../../../common/enum/position-status";
import moment from "moment";
import FetchProcedureCreationPositions = TechnicalCommercialProposals.FetchProcedureCreationPositions;
import { RequestFilters } from "../../../../../common/models/request-filters";

@Component({
  templateUrl: './technical-commercial-proposal-view.component.html',
  styleUrls: ['technical-commercial-proposal-view.component.scss'],
  animations: [trigger('sidebarHide', [
    transition(':leave', animate('300ms ease', style({ 'max-width': '0', 'margin-left': '0' }))),
  ])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicalCommercialProposalViewComponent implements OnInit, OnDestroy {
  @Select(TechnicalCommercialProposalState.proposals) proposals$: Observable<CommonProposal[]>;
  @Select(TechnicalCommercialProposalState.proposalsByPositions) proposalsByPositions$: Observable<CommonProposalByPosition[]>;
  @Select(TechnicalCommercialProposalState.positions) positions$: Observable<RequestPosition[]>;
  @Select(TechnicalCommercialProposalState.availablePositions) availablePositions$: Observable<RequestPosition[]>;
  @Select(TechnicalCommercialProposalState.procedureCreationPositions) procedureCreationPositions$: Observable<RequestPosition[]>;
  @Select(TechnicalCommercialProposalState.procedures) procedures$: Observable<Procedure[]>;
  @Select(TechnicalCommercialProposalState.status) status$: Observable<StateStatus>;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.status) requestStatus$: Observable<StateStatus>;

  requestId: Uuid;
  groupId: Uuid;

  readonly destroy$ = new Subject();
  readonly procedureSource = ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL;
  readonly downloadTemplate = (requestId: Uuid, groupId: Uuid) => new DownloadTemplate(requestId, groupId);
  readonly uploadTemplate = (requestId: Uuid, groupId: Uuid, files: File[]) => new UploadTemplate(requestId, files, groupId);
  readonly downloadAnalyticalReport = (requestId: Uuid, groupId: Uuid) => new DownloadAnalyticalReport(requestId, groupId);
  readonly publishPositions = (requestId: Uuid, groupId: Uuid, proposalPositions: CommonProposalByPosition[]) => new Publish(requestId, groupId, proposalPositions);
  readonly updateProcedures = (requestId: Uuid, groupId: Uuid) => [new RefreshProcedures(requestId, groupId), new FetchAvailablePositions(requestId, groupId)];
  readonly fetchProcedureCreationPositions = (requestId: Uuid, groupId: Uuid, query?: string, payload?: RequestFilters) => new FetchProcedureCreationPositions(requestId, groupId, query, payload);
  readonly rollback = (requestId: Uuid, groupId: Uuid, { id }: RequestPosition) => new Rollback(requestId, groupId, id);
  readonly create = (requestId: Uuid, groupId: Uuid, payload: Partial<CommonProposal>, items?: CommonProposalItem[]) => new Create(requestId, groupId, payload, items);
  readonly edit = (requestId: Uuid, groupId: Uuid, payload: Partial<CommonProposal> & { id: Uuid }, items?: CommonProposalItem[]) => new Update(requestId, groupId, payload, items);
  readonly canRollback = ({ status, statusChangedDate }: RequestPosition, rollbackDuration: number) => status === PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT &&
    moment().diff(moment(statusChangedDate), 'seconds') < rollbackDuration

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    public store: Store,
    public title: Title,
    public app: AppComponent,
    public groupService: TechnicalCommercialProposalGroupService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      tap(({id, groupId }) => { this.requestId = id; this.groupId = groupId; }),
      tap(({id, groupId}) => this.store.dispatch([new Fetch(id, groupId)])),
      delayWhen(({ id, groupId }) => this.groupService.info(id, groupId).pipe(tap(
        ({ name }) => this.title.setTitle(name)
      ))),
      delayWhen(({id}) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([{ groupId }, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/backoffice" },
        { label: `Заявка №${number}`, link: `/requests/backoffice/${id}` },
        { label: 'Согласование ТКП', link: `/requests/backoffice/${id}/technical-commercial-proposals`},
        { label: 'Страница предложений', link: `/requests/backoffice/${id}/technical-commercial-proposals/${groupId}` }
      ]),
      takeUntil(this.destroy$)
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(Create, Update, Publish, UploadTemplate),
      throttleTime(1),
      takeUntil(this.destroy$)
    ).subscribe(({ action, result }) => {
      const e = result.error as any;

      // todo Сократить код
      if (action instanceof Publish) {
        this.store.dispatch(e ?
          new ToastActions.Error(e && e.error.detail) :
          new ToastActions.Success(`Отправлено на согласование`));
      } else {
        this.store.dispatch(e ?
          new ToastActions.Error(e && e.error.detail) :
          new ToastActions.Success(`ТКП успешно сохранено`));
      }
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
    if (view === "list") {
      this.store.dispatch([new FetchAvailablePositions(this.requestId, this.groupId)]);
    }

    this.app.noHeaderStick = this.app.noContentPadding = view !== "list";
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
