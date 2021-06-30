import { ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { Request } from "../../../../common/models/request";
import { TechnicalProposals } from "../../../actions/technical-proposal.actions";
import { TechnicalProposal } from "../../../../common/models/technical-proposal";
import { Uuid } from "../../../../../cart/models/uuid";
import { UxgBreadcrumbsService, UxgTabTitleComponent } from "uxg";
import { RequestPosition } from "../../../../common/models/request-position";
import { FeatureService } from "../../../../../core/services/feature.service";
import { RequestActions } from "../../../actions/request.actions";
import { Select, Store } from "@ngxs/store";
import { RequestState } from "../../../states/request.state";
import { TechnicalProposalsStatus } from "../../../../common/enum/technical-proposals-status";
import { TechnicalProposalState } from "../../../states/technical-proposal.state";
import { StateStatus } from "../../../../common/models/state-status";
import { FormBuilder } from "@angular/forms";
import { TechnicalProposalFilter } from "../../../../common/models/technical-proposal-filter";
import { UxgFilterCheckboxList } from "uxg";
import { searchContragents } from "../../../../../shared/helpers/search";
import { TechnicalProposalsStatusesLabels } from "../../../../common/dictionaries/technical-proposals-statuses-labels";
import Fetch = TechnicalProposals.Fetch;
import Filter = TechnicalProposals.Filter;
import FetchAvailableFilters = TechnicalProposals.FetchAvailableFilters;

@Component({
  templateUrl: './technical-proposal-list.component.html',
  styleUrls: ['./technical-proposal-list.component.scss'],
})
export class TechnicalProposalListComponent implements OnInit, OnDestroy {
  @ViewChild('sentToReviewTab') sentToReviewTabElRef: UxgTabTitleComponent;
  @ViewChild('reviewedTab') reviewedTabElRef: UxgTabTitleComponent;
  @ViewChild('sentToEditTab') sentToEditTabElRef: UxgTabTitleComponent;

  @Select(RequestState.request) request$: Observable<Request>;
  @Select(TechnicalProposalState.status) status$: Observable<StateStatus>;
  @Select(TechnicalProposalState.availableFilters) availableFilters$: Observable<TechnicalProposalFilter>;
  @Select(TechnicalProposalState.proposalsByStatus([TechnicalProposalsStatus.SENT_TO_REVIEW])) proposalsSentToReview$: Observable<TechnicalProposal[]>;
  @Select(TechnicalProposalState.proposalsByStatus([TechnicalProposalsStatus.SENT_TO_EDIT])) proposalsSentToEdit$: Observable<TechnicalProposal[]>;
  @Select(TechnicalProposalState.proposals) technicalProposals$: Observable<TechnicalProposal[]>;
  @Select(TechnicalProposalState.proposalsLength) proposalsLength$: Observable<number>;
  @Select(TechnicalProposalState.proposalsByStatus([
    TechnicalProposalsStatus.ACCEPTED,
    TechnicalProposalsStatus.PARTIALLY_ACCEPTED,
    TechnicalProposalsStatus.CANCELED
  ])) proposalsReviewed$: Observable<TechnicalProposal[]>;


  readonly destroy$ = new Subject();
  readonly form = this.fb.group({ positionName: '', contragents: [[]], tpStatus: [[]] });
  readonly contragentsSearch$ = new BehaviorSubject<string>("");

  readonly contragentsFilter$: Observable<UxgFilterCheckboxList<Uuid>> = combineLatest([this.contragentsSearch$, this.availableFilters$]).pipe(
    map(([q, f]) => searchContragents(q, f?.contragents ?? []).map(c => ({ label: c.shortName, value: c.id })))
  );

  readonly statusesFilter$: Observable<UxgFilterCheckboxList<TechnicalProposalsStatus>> = this.availableFilters$.pipe(
    map((f) => f?.tpStatus.map(value => ({ label: TechnicalProposalsStatusesLabels[value], value }))),
  );

  requestId: Uuid;
  positions$: Observable<RequestPosition[]>;
  technicalProposalsStatus = TechnicalProposalsStatus;
  activeTab = 'SENT_TO_REVIEW';
  readonly filter = (request: Request, filters: TechnicalProposalFilter<Uuid>) => new Filter(request.id, filters);

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    public featureService: FeatureService,
    public store: Store,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      tap(({ id }) => this.requestId = id),
      tap(({ id }) => this.store.dispatch([new Fetch(id), new FetchAvailableFilters(id)])),
      switchMap(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({ id, number }) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${ number }`, link: `/requests/customer/${ id }` },
        { label: 'Согласование технических предложений', link: `/requests/customer/${ id }/technical-proposals` }
      ]),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get activeList$(): Observable<TechnicalProposal[]> {
    switch (this.activeTab) {
      case this.technicalProposalsStatus.SENT_TO_REVIEW:
        return this.proposalsSentToReview$;
      case this.technicalProposalsStatus.SENT_TO_EDIT:
        return this.proposalsSentToEdit$;
      case this.technicalProposalsStatus.ACCEPTED:
        return this.proposalsReviewed$;
      default:
        return this.proposalsSentToReview$;
    }
  }

  onToggle(event, status) {
    if (event) {
      this.activeTab = status;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
