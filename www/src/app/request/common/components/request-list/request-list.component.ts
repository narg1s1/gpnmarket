import { saveAs } from 'file-saver/src/FileSaver';
import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { Store } from '@ngxs/store';
import { RequestService } from './../../../back-office/services/request.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { RequestStatusCount } from "../../models/requests-list/request-status-count";
import { UxgModalComponent, UxgTabTitleComponent } from "uxg";
import { RequestsListFilter } from "../../models/requests-list/requests-list-filter";
import { RequestStatus } from "../../enum/request-status";
import { FeatureService } from "../../../../core/services/feature.service";
import { StateStatus } from "../../models/state-status";
import { RequestsList } from "../../models/requests-list/requests-list";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { map, switchMap, takeUntil, tap, finalize } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { WsTypes } from "../../../../websocket/enum/ws-types";
import { WebsocketService } from "../../../../websocket/services/websocket.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { RequestsListSort } from "../../models/requests-list/requests-list-sort";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AvailableFilters } from "../../models/requests-list/available-filters";
import { PositionStatus } from "../../enum/position-status";
import { PositionStatusesLabels } from "../../dictionaries/position-statuses-labels";
import { PositionStatusesFrequent } from "../../dictionaries/position-statuses-frequent";
import { Uuid } from "../../../../cart/models/uuid";
import { UxgFilterCheckboxList } from "uxg";
import { searchContragents, searchUsers } from "../../../../shared/helpers/search";
import moment from "moment";
import { SelectItemsWithSearchComponent } from "../../../../shared/components/select-items-with-search/select-items-with-search.component";

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestListComponent implements OnInit, OnDestroy {
  @ViewChild('downloadRequestsModal') downloadRequestsModal: UxgModalComponent;
  @ViewChild('requestsSelectList') requestsSelectList: SelectItemsWithSearchComponent;
  @ViewChild('allProgressTab') allProgressTab: UxgTabTitleComponent;
  @ViewChild('inProgressTab') inProgressTabElRef: UxgTabTitleComponent;
  @ViewChild('newTab') newTabElRef: UxgTabTitleComponent;
  @ViewChild('draftTab') draftTabElRef: UxgTabTitleComponent;
  @ViewChild('onApprovalTab') onApprovalTabElRef: UxgTabTitleComponent;
  @ViewChild('completedTab') completedTabElRef: UxgTabTitleComponent;

  @Input() statusCounters: RequestStatusCount;
  @Input() status: StateStatus;
  @Input() requests: RequestsList[];
  @Input() tabTotal: number;
  @Input() total: number;
  @Input() pageSize: number;
  @Input() availableFilters$: Observable<AvailableFilters>;
  @Input() filters: {page?: number, filters?: RequestsListFilter};
  @Input() form: FormGroup;
  @Input() downloadRequestsList: RequestsList[];
  @Output() filter = new EventEmitter<{ page?: number, filters?: RequestsListFilter, sort?: RequestsListSort }>();
  @Output() addRequest = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() downloadRequests = new EventEmitter<{ requestIds: Uuid[] }>();
  @Output() openDownloadRequestsListModal = new EventEmitter();

  requestsForm = new FormGroup({
    requestIds: new FormControl([], Validators.required),
  });

  customFilterForm = new FormGroup({
    createdDateFrom: new FormControl(null),
    createdDateTo: new FormControl(null),
  });

  sortDirection: string = null;
  sortingColumn: string;

  hideNeedUpdate = true;
  customers$: Observable<UxgFilterCheckboxList<Uuid>>;
  users$: Observable<UxgFilterCheckboxList<Uuid>>;
  positionStatuses$: Observable<{ value: PositionStatus, item: AvailableFilters["positionStatuses"][number] }[]>;
  isExcelInQueue = false;

  readonly pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
  readonly destroy$ = new Subject();
  readonly RequestStatus = RequestStatus;
  readonly customersSearch$ = new BehaviorSubject<string>("");
  readonly usersSearch$ = new BehaviorSubject<string>("");
  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly getDeliveryDate = (min, max): string => min === max ? min : min + " – " + max;
  readonly calcPieChart = ({ requestData: d }: RequestsList) => (65 - (65 * d.completedPositionsCount / d.positionsCount * 100) / 100);
  readonly totalCount = () => Object.values(this.statusCounters ?? {}).reduce((total, curr) => total += +curr, 0);

  constructor(
    private route: ActivatedRoute,
    private wsService: WebsocketService,
    private cd: ChangeDetectorRef,
    public feature: FeatureService,
    public user: UserInfoService,
    private requestService: RequestService,
    private store: Store
  ) {}

  ngOnInit() {
    this.wsService.on(WsTypes.REQUEST_LIST_UPDATED).pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hideNeedUpdate = false;
        this.cd.detectChanges();
      });

    this.customers$ = this.availableFilters$ && this.customersSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchContragents(q, f?.contragents ?? []).map(c => ({ label: c.shortName, value: c.id }))
      ))),
      tap(() => this.cd.detectChanges())
    );

    this.users$ = this.availableFilters$ && this.usersSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchUsers(q, f?.users ?? []).map(u => ({ label: u.shortName, value: u.id }))
        ))),
      tap(() => this.cd.detectChanges())
    );

    this.positionStatuses$ = this.availableFilters$?.pipe(map(f => f?.positionStatuses.map(
      status => ({ value: status.status, item: status, hideFolded: PositionStatusesFrequent.indexOf(status.status) < 0 })
    )));

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortBy(column) {
    if (this.sortingColumn !== column) {
      this.sortDirection = null;
    }

    const directions = [ "ASC", "DESC", null ];
    let index = directions.indexOf(this.sortDirection) + 1;
    if (index === directions.length) {
      index = 0;
    }
    this.sortDirection = directions[index];
    this.sortingColumn = column;

    if (this.sortDirection === null) {
      this.filter.emit({ sort: { orderBy: null, sortDirection: null } });
      return;
    }

    this.filter.emit({ sort: { orderBy: column, sortDirection: this.sortDirection } });
  }


  switchToPrioritizedTab(requests) {
    // Если заявок не найдено, ничего не делаем, остаёмся в том же табе
    if (requests.entities.length !== 0) {
      return false;
    }

    let firstNotEmptyTab;

    // Находим и сохраняем первый таб, в котором есть результаты по запросу
    for (const [key, value] of Object.entries(requests.statusCounters)) {
      if (value > 0) {
        firstNotEmptyTab = key;
        break;
      }
    }

    // Активируем найденный таб с результатами
    switch (firstNotEmptyTab) {
      case 'inProgressRequestsCount':
        this.clickOnTab(RequestStatus.IN_PROGRESS);
        break;
      case 'newRequestsCount':
        this.clickOnTab(RequestStatus.NEW);
        break;
      case 'onCustomerApprovalRequestsCount':
        this.clickOnTab(RequestStatus.ON_CUSTOMER_APPROVAL);
        break;
      case 'draftRequestsCount':
        this.clickOnTab(RequestStatus.DRAFT);
        break;
      case 'completedRequestsCount':
        this.clickOnTab(RequestStatus.COMPLETED);
        break;
      default:
        return false;
    }
  }

  clickOnTab(tab) {
    let tabFilters = [];

    switch (tab) {
      // todo Тернарка почему-то не зашла в свитчкейсе, не понял почему
      case RequestStatus.IN_PROGRESS:
        if (!this.inProgressTabElRef?.disabled) {
          tabFilters = [RequestStatus.IN_PROGRESS];
          this.inProgressTabElRef.activate();
        } else {
          return false;
        }
        break;
      case RequestStatus.NEW:
        if (!this.newTabElRef?.disabled) {
          tabFilters = [RequestStatus.NEW];
          this.newTabElRef.activate();
        } else {
          return false;
        }
        break;
      case RequestStatus.ON_CUSTOMER_APPROVAL:
        if (!this.onApprovalTabElRef?.disabled) {
          tabFilters = [RequestStatus.ON_CUSTOMER_APPROVAL];
          this.onApprovalTabElRef.activate();
        } else {
          return false;
        }
        break;
      case RequestStatus.DRAFT:
        if (!this.draftTabElRef?.disabled) {
          tabFilters = [RequestStatus.DRAFT];
          this.draftTabElRef.activate();
        } else {
          return false;
        }
        break;
      case RequestStatus.COMPLETED:
        if (!this.completedTabElRef?.disabled) {
          tabFilters = [RequestStatus.COMPLETED, RequestStatus.NOT_RELEVANT];
          this.completedTabElRef.activate();
        } else {
          return false;
        }
        break;
      case null:
          tabFilters = [];
          this.allProgressTab.activate();
        break;
      default:
        return false;
    }

    this.filter.emit({ filters: { requestListStatusesFilter: tabFilters } });
  }

  emitFilter(f: RequestsListFilter) {
    this.filter.emit({ filters: {
      ...f,
      shipmentDateFrom: f.shipmentDateFrom ? moment(f.shipmentDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD') : null,
      shipmentDateTo: f.shipmentDateTo ? moment(f.shipmentDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD') : null
    }});
  }

  canCreateRequest(): boolean {
    return this.feature.authorize('createRequest') && !!this.user.getContragentId();
  }

  onDownloadRequests() {
    const requestNumbers = this.requestsForm.get('requestIds').value?.map(request => request.request.number);

    if (requestNumbers?.length) {
      this.isExcelInQueue = true;
      this.requestService.downloadRequests(requestNumbers)
        .pipe(
          finalize(() => {
            this.cd.detectChanges();
          })
        )
        .subscribe(response => {
          this.isExcelInQueue = false;
          this.store.dispatch(new ToastActions.Success(`Запрос на выгрузку в Excel отправлен. Когда запрос будет завершен, вы получите уведомление.`));
        }, () => {
          this.isExcelInQueue = false;
          this.store.dispatch(new ToastActions.Error(`Не удалось выгрузить Excel`));
        });
    }
  }

  resetSelectedRequests() {
    this.requestsForm.reset();
    this.customFilterForm.reset();

    this.requestsSelectList.form.get('search').reset("");
    this.requestsSelectList.formItems?.controls.map(control => control.get("checked").setValue(false));
  }

  filterRequests(q: string, request: RequestsList): boolean {
    const createdDateFrom = this.customFilterForm.get('createdDateFrom').value;
    const createdDateTo = this.customFilterForm.get('createdDateTo').value;
    const publishedDate = moment(request.request.publishedDate);

    let isBetween = true;

    if (moment(createdDateFrom, "DD.MM.YYYY").isValid() || moment(createdDateTo, "DD.MM.YYYY").isValid()) {
      const startDate = moment(createdDateFrom, "DD.MM.YYYY").isValid() ? moment(createdDateFrom, "DD.MM.YYYY") : moment('01.01.1970');
      const endDate = moment(createdDateTo, "DD.MM.YYYY").isValid() ? moment(createdDateTo, "DD.MM.YYYY") : moment();

      isBetween = publishedDate.isBetween(startDate, endDate);
    }

    return isBetween && request.request.name.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  toRequestItem(request: any): RequestsList {
    return request as RequestsList;
  }

  limitedRange(date: Date): boolean {
    return moment().diff(moment(date), 'days') > 100;
  }

  openDownloadRequestsModal() {
    this.downloadRequestsModal.open();
    this.openDownloadRequestsListModal.emit();
  }

  trackByRequestId = (request: RequestsList) => request.request.id;
}
