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
import { CommercialProposals } from "../../../../actions/commercial-proposal.actions";
import { CommercialProposalsService } from "../../../../services/commercial-proposals.service";
import { CommercialProposalState } from "../../../../states/commercial-proposal.state";
import { RequestPosition } from "../../../../../common/models/request-position";
import Fetch = CommercialProposals.Fetch;
import Review = CommercialProposals.Review;
import DownloadAnalyticalReport = CommercialProposals.DownloadAnalyticalReport;
import { ProposalSource } from "../../../../../back-office/enum/proposal-source";

@Component({
  templateUrl: './commercial-proposal-view.component.html',
  providers: [PluralizePipe]
})
export class CommercialProposalViewComponent implements OnInit, OnDestroy {
  @Select(RequestState.request) readonly request$: Observable<Request>;
  @Select(CommercialProposalState.proposalsByPos(['NEW', 'SENT_TO_REVIEW']))
  readonly proposalsByPosSentToReview$: Observable<CommonProposalByPosition[]>;
  @Select(CommercialProposalState.proposalsByPos(['APPROVED', 'REJECTED']))
  readonly proposalsByPosReviewed$: Observable<CommonProposalByPosition[]>;
  @Select(CommercialProposalState.proposalsByPos(['SENT_TO_EDIT']))
  readonly proposalsByPosSendToEdit$: Observable<CommonProposalByPosition[]>;
  @Select(CommercialProposalState.proposals)
  readonly proposals$: Observable<CommonProposal[]>;
  @Select(CommercialProposalState.proposalsByStatus(['NEW', 'SENT_TO_REVIEW']))
  readonly proposalsSentToReview$: Observable<CommonProposal[]>;
  @Select(CommercialProposalState.proposalsByStatus(['APPROVED']))
  readonly proposalsReviewed$: Observable<CommonProposal[]>;
  @Select(CommercialProposalState.proposalsByStatus(['SENT_TO_EDIT']))
  readonly proposalsSendToEdit$: Observable<CommonProposal[]>;
  @Select(CommercialProposalState.positions)
  readonly positions$: Observable<RequestPosition[]>;
  @Select(CommercialProposalState.status)
  readonly stateStatus$: Observable<StateStatus>;

  groupId: Uuid;
  view: ProposalsView = "grid";
  readonly destroy$ = new Subject();
  readonly source = ProposalSource.COMMERCIAL_PROPOSAL;
  readonly review = (requestId: Uuid, proposalItems: CommonProposalItem[], positions: RequestPosition[]) => new Review(requestId, proposalItems, positions);
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
    public service: CommercialProposalsService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({ groupId }) => this.groupId = groupId),
      tap(({ id, groupId }) => this.store.dispatch(new Fetch(id, groupId))),
      delayWhen(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([{ groupId }, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${ number }`, link: `/requests/customer/${ id }` },
        { label: 'Согласование КП', link: `/requests/customer/${ id }/commercial-proposals` },
        { label: 'Страница предложений', link: `/requests/customer/${ id }/commercial-proposals/${ groupId }` }
      ]),
      switchMap(([{ id, groupId }]) => this.service.group(id, groupId)),
      tap(({ name }) => this.title.setTitle(name)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(Review),
      takeUntil(this.destroy$)
    ).subscribe(({ result, action }) => {
      const e = result.error as any;
      const length = (action?.proposalItems?.length ?? 0) + (action?.positions?.length ?? 0) || 1;
      let text = "По $0 принято решение";

      text = text.replace(/\$(\d)/g, (all, i) => [
        this.pluralize.transform(length, "позиции", "позициям", "позициям"),
        this.pluralize.transform(length, "предложение", "предложения", "предложений"),
        this.pluralize.transform(length, "позиция", "позиции", "позиций"),
      ][i] || all);

      this.store.dispatch(e ? new ToastActions.Error(e && e.error?.detail) : new ToastActions.Success(text));
    });

    this.switchView(this.view);
  }

  switchView(view: ProposalsView) {
    this.view = view;
    this.app.noHeaderStick = this.app.noContentPadding = view !== "list";
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
