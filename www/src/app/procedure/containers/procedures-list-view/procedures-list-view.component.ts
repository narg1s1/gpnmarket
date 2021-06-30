import { IProcedureRequestFromSupplier, RequestFromSupplierStatuses } from '../../../request/common/models/requests-list/request-from-supplier';
import { UserInfoService } from '../../../user/service/user-info.service';
import { Component, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { Select, Store } from "@ngxs/store";
import { DashboardState } from "../../../dashboard/back-office/states/dashboard.state";
import {Procedure} from "../../../request/back-office/models/procedure";
import { debounceTime, map, scan, switchMap, takeUntil, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { DashboardActions } from "../../../dashboard/back-office/actions/dashboard.actions";
import { FormBuilder, Validators } from "@angular/forms";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../core/config/gpnmarket-config.interface";
import { Okpd2Item } from "../../../core/models/okpd2-item";
import { UxgFilterCheckboxList, UxgModalComponent } from "uxg";
import { Uuid } from "../../../cart/models/uuid";
import { searchContragents, searchUsers } from "../../../shared/helpers/search";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { StateStatus } from "../../../request/common/models/state-status";
import { ProceduresStatusList } from "../../../request/back-office/models/procedures-status-list";
import { ProceduresFilter } from "../../../request/back-office/models/procedures-filter";
import moment from "moment";
import { ProcedureService } from "../../../request/back-office/services/procedure.service";
import { TechnicalCommercialProposalState } from "../../../request/back-office/states/technical-commercial-proposal.state";
import { RequestPosition } from "../../../request/common/models/request-position";
import { CommercialProposalState } from "../../../request/back-office/states/commercial-proposal.state";
import { RequestState } from "../../../request/back-office/states/request.state";
import { Request } from "../../../request/common/models/request";
import { RequestActions } from "../../../request/back-office/actions/request.actions";
import { ProceduresListComponent } from "../../../dashboard/back-office/components/dashboard/procedures-list/procedures-list.component";
import { EmployeeInfoBrief } from "../../../employee/models/employee-info";
import FetchProcedures = DashboardActions.FetchProcedures;
import FetchProceduresAvailableFilters = DashboardActions.FetchProceduresAvailableFilters;
import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { UserRole } from "../../../user/models/user-role";

@Component({
  selector: 'app-procedures-list-view',
  templateUrl: './procedures-list-view.component.html',
  styleUrls: ['./procedures-list-view.component.scss']
})
export class ProceduresListViewComponent implements OnDestroy, OnInit {

  @ViewChild('importProcedureOffersModal') importProcedureOffersModal: UxgModalComponent;
  @ViewChild('procedureBargainModal') procedureBargainModal: UxgModalComponent;
  @ViewChild('cancelProcedureModal') cancelProcedureModal: UxgModalComponent;
  @ViewChild('proceduresListComponent') proceduresListComponent: ProceduresListComponent;

  @Select(TechnicalCommercialProposalState.availablePositions) technicalCommercialProposalPositions$: Observable<RequestPosition[]>;
  @Select(CommercialProposalState.availablePositions) commercialProposalPositions$: Observable<RequestPosition[]>;
  @Select(RequestState.request) request$: Observable<Request>;

  @Select(DashboardState.status) status$: Observable<StateStatus>;
  @Select(DashboardState.procedures) procedures$: Observable<Procedure[]>;
  @Select(DashboardState.proceduresTotalCount) proceduresTotalCount$: Observable<number>;
  @Select(DashboardState.proceduresFilterAvailableOkpd2List) availableOkpd2List$: Observable<Okpd2Item[]>;
  @Select(DashboardState.proceduresFilterAvailableStatusesList) availableStatusesList$: Observable<ProceduresStatusList[]>;
  @Select(DashboardState.proceduresFilterAvailableContragentList) availableContragentList$: Observable<ContragentShortInfo[]>;
  @Select(DashboardState.proceduresFilterAvailableUserList) availableUserList$: Observable<EmployeeInfoBrief[]>;

  proceduresList$ = this.procedures$;
  selectedProcedure: Procedure;
  loading: boolean;
  newRequestsCount = 0;

  procedureCancelReasons = [
    [UserRole.CUSTOMER_BUYER,  'На основе запроса Заказчика'],
    [UserRole.BACKOFFICE_BUYER, 'Инициатива БО'],
  ];

  readonly filterForm = this.fb.group({
    procedureId: '',
    procedureTitle: '',
    okpd2: null,
    users: [[]],
    customersIds: [[]],
    purchaseForm: null,
    statuses: [[]],
    isRetrade: false,
    datePublishedFrom: null,
    datePublishedTo: null,
    dateEndRegistrationFrom: null,
    dateEndRegistrationTo: null,
    dateSummingUpFrom: null,
    dateSummingUpTo: null,
  });

  readonly cancelProcedureForm = this.fb.group({
    initiatorRole: [UserRole.CUSTOMER_BUYER, [Validators.required]],
    comment: [null, [Validators.required]],
  });

  readonly requestsFilterForm = this.fb.group({
    procedureTitle: '',
  });

  readonly pageSize = this.appConfig.paginator.pageSize;
  readonly pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
  readonly fetchFilters$ = new Subject<{ page?: number, pageSize?: number, filters?: ProceduresFilter }>();
  readonly requestsFiltersSubject$ = new Subject<{ page?: number, pageSize?: number, filters?: ProceduresFilter }>();
  readonly destroy$ = new Subject();
  readonly contragentsSearch$ = new BehaviorSubject<string>("");
  readonly contragentsFilter$: Observable<UxgFilterCheckboxList<Uuid>> = combineLatest([this.contragentsSearch$, this.availableContragentList$]).pipe(
    map(([query, contragents]) => {
      return searchContragents(query, contragents || []).map(c => ({ label: c.shortName, value: c.id }));
    })
  );
  readonly usersSearch$ = new BehaviorSubject<string>("");
  readonly usersFilter$: Observable<UxgFilterCheckboxList<Uuid>> = combineLatest([this.usersSearch$, this.availableUserList$]).pipe(
    map(([query, users]) => {
      return searchUsers(query, users || []).map(u => ({ label: u.shortName, value: u.id }));
    })
  );

  searchOkpd2 = (query, items: Okpd2Item[]) => {
    return items.filter(({code, name}) => (code?.toLowerCase().indexOf(query) >= 0 || name?.toLowerCase().indexOf(query) >= 0));
  }

  readonly getOkpd2Name = ({ name }) => name;

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    private route: ActivatedRoute,
    public store: Store,
    private router: Router,
    private fb: FormBuilder,
    private procedureService: ProcedureService,
    private cdr: ChangeDetectorRef,
    private userInfoService: UserInfoService
  ) { }

  ngOnInit(): void {
    this.proceduresList$ = null;

    this.fetchFilters$.pipe(
      debounceTime(100),
      tap(({ page }) => {
        if (!page) { this.router.navigate(["."], { relativeTo: this.route, queryParams: null }); }
      }),
      scan(({ filters: prev }, { page = 1, filters: curr }) => {
        const filters = { ...prev, ...curr };
        return ({ page, filters });
      }, {} as { page?: number, filters?: ProceduresFilter }),
      switchMap(data => {
        if (data.filters.dateEndRegistrationTo) {
          data.filters.dateEndRegistrationTo = moment(data.filters.dateEndRegistrationTo, 'DD.MM.YYYY').add(1, 'day').format('DD.MM.YYYY');
        }

        if (data.filters.datePublishedTo) {
          data.filters.datePublishedTo = moment(data.filters.datePublishedTo, 'DD.MM.YYYY').add(1, 'day').format('DD.MM.YYYY');
        }

        if (data.filters.dateSummingUpTo) {
          data.filters.dateSummingUpTo = moment(data.filters.dateSummingUpTo, 'DD.MM.YYYY').add(1, 'day').format('DD.MM.YYYY');
        }

        const filters = { startFrom: (data.page - 1) * this.pageSize, pageSize: this.pageSize, filters: data.filters };
        return this.store.dispatch(new FetchProcedures(filters, false));
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => this.proceduresList$ = this.procedures$);

    this.store.dispatch(new FetchProceduresAvailableFilters({}));
  }

  importProcedureOffers(procedureId) {
    this.loading = true;

    this.procedureService.importOffersFromProcedure(procedureId).subscribe(() => {
      this.refreshProcedures();
      this.loading = false;
      this.selectedProcedure = null;
      this.proceduresListComponent.selectedProcedure = null;
      this.importProcedureOffersModal.close();
    });
  }

  prepareProcedureBargainModal(selectedProcedure) {
    this.selectedProcedure = selectedProcedure;
    this.store.dispatch(new RequestActions.Fetch(this.selectedProcedure.requestId)).subscribe(() => {
      this.procedureBargainModal.open();
    });
  }

  cancelProcedure() {
    this.loading = true;
    const {initiatorRole, comment} = this.cancelProcedureForm.value;

    this.procedureService.cancelProcedure(this.selectedProcedure.id, initiatorRole, comment).subscribe(() => {
      this.refreshProcedures();
      this.loading = false;
      this.selectedProcedure = null;
      this.proceduresListComponent.selectedProcedure = null;
      this.cancelProcedureModal.close();
      this.store.dispatch(new ToastActions.Success('Процедура отменена'));
    }, () => {
      this.loading = false;
      this.store.dispatch(new ToastActions.Success('Не удалось отменить процедуру'));
    });
  }

  refreshProcedures() {
    this.fetchFilters$.next({});
  }

  onRequestsRecieved($event: {data: IProcedureRequestFromSupplier[]}) {
    const requestsNew = $event.data?.filter((request: IProcedureRequestFromSupplier) => request.status === RequestFromSupplierStatuses.AWAITING);
    this.newRequestsCount = requestsNew?.length || 0;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
