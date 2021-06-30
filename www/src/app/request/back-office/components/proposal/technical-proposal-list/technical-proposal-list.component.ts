import { ActivatedRoute } from "@angular/router";
import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, finalize, map, mapTo, publishReplay, refCount, shareReplay, switchMap, takeUntil, tap } from "rxjs/operators";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { Request } from "../../../../common/models/request";
import { RequestService } from "../../../services/request.service";
import { TechnicalProposal } from "../../../../common/models/technical-proposal";
import { TechnicalProposalsService } from "../../../services/technical-proposals.service";
import { Uuid } from "../../../../../cart/models/uuid";
import { UxgBreadcrumbsService } from "uxg";
import { RequestPosition } from "../../../../common/models/request-position";
import { FeatureService } from "../../../../../core/services/feature.service";
import { RequestActions } from "../../../actions/request.actions";
import { Select, Store } from "@ngxs/store";
import { RequestState } from "../../../states/request.state";
import { ProposalSource } from "../../../enum/proposal-source";
import { TechnicalProposalFilter } from "../../../../common/models/technical-proposal-filter";
import { Procedure } from "../../../models/procedure";
import { ProcedureService } from "../../../services/procedure.service";
import { ProcedureAction } from "../../../models/procedure-action";
import { StateStatus } from "../../../../common/models/state-status";
import { TechnicalProposalsStatus } from "../../../../common/enum/technical-proposals-status";
import { FormBuilder } from "@angular/forms";
import { TechnicalProposalsStatusesLabels } from "../../../../common/dictionaries/technical-proposals-statuses-labels";
import { searchContragents } from "../../../../../shared/helpers/search";
import { UxgFilterCheckboxList } from "uxg";

@Component({
  templateUrl: './technical-proposal-list.component.html',
  styleUrls: ['technical-proposal-list.component.scss']
})
export class TechnicalProposalListComponent implements OnInit, OnDestroy {
  @Select(RequestState.request) request$: Observable<Request>;
  readonly destroy$ = new Subject();
  requestId: Uuid;
  technicalProposals$: Observable<TechnicalProposal[]>;
  availableFilters$: Observable<TechnicalProposalFilter>;
  contragentsFilter$: Observable<UxgFilterCheckboxList<Uuid>>;
  statusesFilter$: Observable<UxgFilterCheckboxList<TechnicalProposalsStatus>>;
  procedures$: Observable<Procedure[]>;
  positions$: Observable<RequestPosition[]>;
  showForm = false;
  procedureSource = ProposalSource;
  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  prolongModalPayload: Procedure;
  state: StateStatus = "pristine";
  readonly form = this.fb.group({ positionName: '', contragents: [[]], tpStatus: [[]] });
  readonly contragentsSearch$ = new BehaviorSubject<string>("");

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private requestService: RequestService,
    private technicalProposalsService: TechnicalProposalsService,
    private procedureService: ProcedureService,
    public featureService: FeatureService,
    public store: Store
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      switchMap(({id}) => this.store.dispatch(new RequestActions.Fetch(id))),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, number}) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/backoffice" },
        { label: `Заявка №${number}`, link: `/requests/backoffice/${id}` },
        { label: 'Согласование технических предложений', link: `/requests/backoffice/${id}/technical-proposals` }
      ]),
      tap(() => {
        this.fetch();
        this.fetchAvailableFilters();
        this.fetchProcedures();
        this.fetchPositions();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  fetch() {
    this.technicalProposals$ = this.technicalProposalsService.list(this.requestId, this.form.value).pipe(publishReplay(1), refCount());
  }

  fetchAvailableFilters() {
    this.availableFilters$ = this.technicalProposalsService.availableFilters(this.requestId).pipe(publishReplay(1), refCount());

    this.contragentsFilter$ = this.contragentsSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchContragents(q, f?.contragents ?? []).map(c => ({ label: c.shortName, value: c.id }))
      ))),
    );

    this.statusesFilter$ = this.availableFilters$.pipe(
      map(f => f?.tpStatus?.map(value => ({ label: TechnicalProposalsStatusesLabels[value], value })))
    );
  }

  fetchProcedures() {
    this.procedures$ = this.procedureService.list(this.requestId, ProposalSource.TECHNICAL_PROPOSAL).pipe(
      publishReplay(1), refCount()
    );
  }

  refreshProcedures() {
    this.state = "updating";
    this.procedureService.list(this.requestId, ProposalSource.TECHNICAL_PROPOSAL)
      .pipe(finalize(() => this.state = "received"))
      .subscribe((data) => {
        this.procedures$ = this.procedures$.pipe(mapTo(data));
        this.fetchPositions();
      });
  }

  filter(filters: TechnicalProposalFilter<Uuid>) {
    this.technicalProposalsService.list(this.requestId, filters).subscribe(data => this.technicalProposals$ = of(data));
  }

  fetchPositions() {
    this.positions$ = this.technicalProposalsService.positions(this.requestId).pipe(shareReplay(1));
  }

  /**
   * @TODO uncomment when backend return technicalProposal data
   */
  addTechnicalProposal(technicalProposal) {
    this.fetch();
    this.fetchAvailableFilters();
    // this.technicalProposals$ = this.technicalProposals$.pipe(
    //   map(technicalProposals => {
    //     technicalProposals.unshift(technicalProposal);
    //     return technicalProposals;
    //   })
    // );
  }

  /**
   * @TODO uncomment when backend return technicalProposal data
   */
  updateTechnicalProposal(technicalProposal) {
    this.fetch();
    this.fetchAvailableFilters();
    // this.technicalProposals$ = this.technicalProposals$.pipe(
    //   map(technicalProposals => {
    //     const i = technicalProposals.findIndex(_technicalProposal => _technicalProposal.id === technicalProposal.id);
    //     technicalProposals[i] = technicalProposal;
    //
    //     return technicalProposals;
    //   }),
    //   publishReplay(1), refCount()
    // );
  }

  onCancelPublishTechnicalProposal(technicalProposal: TechnicalProposal) {
    this.technicalProposalsService.rollback(this.requestId, technicalProposal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetch();
        this.fetchAvailableFilters();
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
