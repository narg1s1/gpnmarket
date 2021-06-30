import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UxgFilterDirective } from './../../../projects/uxg/src/modules/filter/uxg-filter.directive';
import { shareReplay } from 'rxjs/operators';
import { scan } from 'rxjs/operators';
import moment from 'moment';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators';
import { debounceTime } from 'rxjs/operators';
import { PositionStatusesFrequent } from '../request/common/dictionaries/position-statuses-frequent';
import { searchContragents, searchString } from 'src/app/shared/helpers/search';
import { searchUsers } from 'src/app/shared/helpers/search';
import { AvailableFilters } from '../request/customer/models/available-filters';
import { Uuid } from '../cart/models/uuid';
import { UxgFilterCheckboxList } from 'uxg';
import { switchMap } from 'rxjs/operators';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { ProposalSource } from '../request/back-office/enum/proposal-source';
import { ProcedureAction } from '../request/back-office/models/procedure-action';
import { Procedure } from "../request/back-office/models/procedure";
import { PositionsService } from './positions.service';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs/operators';
import { RequestGroup } from '../request/common/models/request-group';
import { getFlatPositions, searchGroups } from './positions-helpers';
import { UxgModalComponent } from 'uxg';
import { UserInfoService } from '../user/service/user-info.service';
import { FormBuilder } from '@angular/forms';
import { FeatureService } from '../core/services/feature.service';
import { IPositionsSort, IPositionsFilters, IAvailablePositionsFilters } from './positions-filter';
import { PositionStatus } from '../request/common/enum/position-status';
import { PositionStatusesLabels } from '../request/common/dictionaries/position-statuses-labels';
import { RequestPosition } from '../request/common/models/request-position';
import { Store } from '@ngxs/store';
import { PositionsListState, PositionsListActions } from './positions.state';
import { Select } from '@ngxs/store';
import { IUxgDataTableColumnHeader } from '../../../projects/uxg/src/modules/data-table/uxg-data-table.model';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { RequestActions } from '../request/back-office/actions/request.actions';
import { ToastActions } from '../shared/actions/toast.actions';
import { Request } from 'src/app/request/common/models/request';

@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsComponent extends OnDestroyDirective implements OnInit, AfterViewInit {

  public columnHeaders: IUxgDataTableColumnHeader[] = [
    {name: 'Наименование позиции', alias: 'name', sortable: true, isVisible: true, pinnable: true},
    {name: '№ заяв.', alias: 'number', sortable: true, isVisible: true, customStyles: {'min-width': '100px', 'flex-grow': 1}},
    {name: 'Наименование заяв.', alias: 'requestName', isVisible: true},
    {name: 'Заказчик', alias: 'customer', sortable: true, isVisible: true, customStyles: {'min-width': '200px', 'flex-grow': 1}},
    {name: 'Кол-во', alias: 'quantity', isVisible: true, customStyles: {'min-width': '80px', 'flex-grow': 1}},
    {name: 'Срок пост.', alias: 'deliveryDate', sortable: true, isVisible: true, customStyles: {'min-width': '120px', 'flex-grow': 1}},
    {name: 'Статус', alias: 'status', sortable: true, isVisible: true, customStyles: {'min-width': '220px', 'flex-grow': 1}},
    {name: 'Ответственный', alias: 'responsible', isVisible: true, customStyles: {'min-width': '150px', 'flex-grow': 1}},

    {name: 'Базис поставки', alias: 'basis', customStyles: {'flex-grow': 1}},
    {name: 'Документ', alias: 'doc', customStyles: {'flex-grow': 1}},
    {name: 'НМЦ', alias: 'startPrice', customStyles: {'min-width': '200px'}},
    {name: 'ID процедуры', alias: 'procedureId', sortable: true, customStyles: {'flex-grow': 1}},
    {name: 'Реестр. №', alias: 'procedureRegistryNumber', sortable: true, customStyles: {'flex-grow': 1}},
    {name: 'Завер. приема заяв.', alias: 'endDate', customStyles: {'min-width': '200px'}},
    {name: 'Победитель', alias: 'winner', customStyles: {'min-width': '200px'}},

    {name: '', alias: 'contract', isVisible: true, isAlwaysVisible: true, customStyles: {'min-width': '40px'}},
    {name: '', alias: 'mtrPositionId', isVisible: true, isAlwaysVisible: true, customStyles: {'min-width': '40px'}},
  ];

  @ViewChild('addDocumentsModal') addDocumentsModal: UxgModalComponent;
  @ViewChild('setRegistryExcelModal') setRegistryExcelModal: UxgModalComponent;
  @ViewChild('uxgFilter') uxgFilterDirective: UxgFilterDirective;

  @Select(PositionsListState.positions) positions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.checkedPositions) checkedPositions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.checkedGroups) checkedGroups$: Observable<RequestPosition[]>;
  @Select(PositionsListState.disabledPositionsOnPage) disabledPositionsOnPage$: Observable<RequestPosition[]>;
  @Select(PositionsListState.availableGroups) availableGroups$: Observable<RequestGroup[]>;
  @Select(PositionsListState.status) listStatus$: Observable<string>;
  @Select(PositionsListState.totalCount) totalCount$: Observable<number>;
  @Select(PositionsListState.totalCountWithoutNotRelevantAndCanceled) totalCountWithoutNotRelevantAndCanceled$: Observable<number>;
  @Select(PositionsListState.availableFilters) availableFilters$: Observable<IAvailablePositionsFilters>;

  @Output() changeStatus = new EventEmitter();

  private currentSort: IPositionsSort;

  public mainCheckbox = false;
  public useAllPositions = false;
  public pages$: Observable<number>;
  public currentPageSize = environment.production ? 50 : 25;
  public getCurrencySymbol = getCurrencySymbol;
  public files: File[] = [];
  public isFilesLoading = false;
  public invalidUploadDocument: boolean;
  public PAGE_SIZE_OPTIONS =  [
    {value: 25, label: '25'},
    {value: 50, label: '50'},
    {value: 100, label: '100'},
    {value: 250, label: '250'},
    {value: 500, label: '500'},
  ];
  public isExcelInQueue = false;
  public selectedRequest: Request;
  public procedureTypes = {
    "byPosition": 'Попозиционная закупка',
    "twoStage": "Двухэтапный отбор",
    "byPrice": "Прайсовая закупка",
  };
  public returnToWorkStatus: PositionStatus;
  public returnToWorkStatusComment = null;
  public selectedProcedureType: string = this.procedureTypes.byPosition;
  public procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  public availablePositionsForCreateProcedure$: Observable<RequestPosition[]>;
  public isWithoutStartPrice$: Observable<boolean>;
  public responsibleUsers$: Observable<UxgFilterCheckboxList<Uuid>>;
  public contragentUsers$: Observable<UxgFilterCheckboxList<Uuid>>;
  public positionStatuses$: Observable<{ value: PositionStatus, item: AvailableFilters["positionStatuses"][number] }[]>;
  public procedureRegistryNumbers$: Observable<UxgFilterCheckboxList<string>>;
  public requestsNumbers$: Observable<UxgFilterCheckboxList<string>>;

  readonly responsibleUsersSearch$ = new BehaviorSubject<string>("");
  readonly contragentUsersSearch$ = new BehaviorSubject<string>("");
  readonly procedureRegistryNumbersSearch$ = new BehaviorSubject<string>("");
  readonly requestsNumbersSearch$ = new BehaviorSubject<string>("");
  readonly fetchFilters$ = new Subject<{ page?: number, filters?: IPositionsFilters, sort?: IPositionsSort }>();
  readonly filterForm = this.fb.group({
    positionOrRequestNameOrNumber: '',
    requestsNumbers: [[]],
    positionGroupName: '',
    responsibleUserIds: [[]],
    onlyWithoutResponsibleUser: false,
    onlyWithStartPrice: false,
    onlyWithoutGroup: false,
    contragentUserIds: [[]],
    positionStatuses: [[]],
    procedureRegistryNumbers: [[]],
    procedureId: '',
    procedureEndRegistrationDateFrom: null,
    procedureEndRegistrationDateTo: null,
    procedureDeliveryDateFrom: null,
    procedureDeliveryDateTo: null,
  });
  readonly procedureSource = ProposalSource.POSITION;
  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly PositionStatus = PositionStatus;
  readonly searchGroups = searchGroups;
  readonly uploadPositionFromTemplate = ({files}) => {
    this.store.dispatch( new RequestActions.UploadFromTemplate(this.selectedRequest?.id, files, true) )
      .subscribe(_ => {
        this.onModalSuccess();
        this.cdr.detectChanges();
        this.store.dispatch(new ToastActions.Success(`Позиции из шаблона успешно загружены`));
      });
  }

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private fb: FormBuilder,
    private positionsService: PositionsService,
    public featureService: FeatureService,
    public userService: UserInfoService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.pages$ = this.route.queryParams.pipe(map(params => +params["page"]));

    this.fetchAvailableGroups();
    this.loadAdditionalDataForFilters();
    this.subscribeOnFiltersChange();
  }

  ngAfterViewInit() {
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  onSort(sortPayload: IPositionsSort) {
    const currentPage = this.route.snapshot.queryParams.page || 1;
    this.currentSort = sortPayload;
    this.store.dispatch(
      new PositionsListActions.Fetch((currentPage - 1) * this.currentPageSize, this.currentPageSize, this.filterForm.value, sortPayload)
    ).subscribe(_ => {
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  onPageIndexChanged(pageIndex: number) {
    this.store.dispatch(
      new PositionsListActions.Fetch((pageIndex - 1) * this.currentPageSize, this.currentPageSize, this.filterForm.value, this.currentSort)
    ).subscribe(_ => {
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  onPageSizeChanged(payload: {value: number, label: string | number}) {
    const currentPage = this.route.snapshot.queryParams.page || 1;
    this.currentPageSize = payload.value;
    this.store.dispatch([
      new PositionsListActions.SelectAllPositions(false),
      new PositionsListActions.Fetch((currentPage - 1) * this.currentPageSize, this.currentPageSize, this.filterForm.value, this.currentSort)
    ]).subscribe(_ => {
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  // Выбор 1 позиции
  onPositionSelected(position: RequestPosition) {
    this.store.dispatch(new PositionsListActions.SelectPosition(position))
      .subscribe(_ => {
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      });
  }

  // Выбор группы
  onGroupPositionSelected(positionGroup: RequestPosition) {
    this.store.dispatch([
      new PositionsListActions.SelectGroupPosition(positionGroup),
    ])
      .subscribe(_ => {
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      });
  }

  // Добавление новой позиции
  onPositionAdded() {
    this.onModalSuccess();
    this.store.dispatch(new PositionsListActions.SelectAllPositions(false));
  }

  onModalSuccess(event?: boolean) {
    const currentPage = this.route.snapshot.queryParams.page || 1;
    this.store.dispatch(
      new PositionsListActions.Fetch((currentPage - 1) * this.currentPageSize, this.currentPageSize, this.filterForm.value, this.currentSort)
    ).subscribe(_ => {
      this.mainCheckbox = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  // Выбор всех позиций на странице
  selectAllPositions(event: boolean) {
    this.store.dispatch(new PositionsListActions.SelectAllPositions(event)).subscribe(_ => {
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    });
  }

  // Прикрепляем документы
  onAttachDocumentsToPositions(positions: RequestPosition[]) {
    const positionIds = positions.map(item => item.id);
    const activeFilters = this.filterForm?.value;

    if (this.files?.length) {
      this.isFilesLoading = true;
      this.invalidUploadDocument = false;
      this.store.dispatch(
        new RequestActions.AttachDocuments(null, positionIds, this.files, this.useAllPositions, activeFilters)
      )
      .pipe(
        finalize(() => {
          this.isFilesLoading = false;
          this.invalidUploadDocument = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => {
        this.store.dispatch(new ToastActions.Success(`Файл(ы) успешно прикреплен(ы) к выбранным позициям`));
        this.addDocumentsModal.close();
      },
      () => {
        this.store.dispatch(new ToastActions.Error(`Не удалось прикрепить файлы`));
        this.addDocumentsModal.close();
      });
    } else {
      this.isFilesLoading = false;
      this.invalidUploadDocument = true;
    }
  }

  // Меняем ответственного
  changeResponsibleUser({user, positions}) {
    const activeFilters = this.filterForm?.value;
    const checkedGroups = this.store.selectSnapshot(PositionsListState.checkedGroups);
    this.positionsService.changeResponsibleUser(user.id, positions.map(({ id }) => id), checkedGroups.map(({ id }) => id), this.useAllPositions, activeFilters)
      .subscribe(() => {
        this.store.dispatch(new ToastActions.Success(`Позиции назначены`));
        this.onModalSuccess();
      }, () => {
        this.store.dispatch(new ToastActions.Error(`Не удалось назначить позиции`));
      });
  }

  // Показываем блок с выбором всех позиций
  showAllPositionsSelection(checkedPositions: RequestPosition[]) {
    const positionsOnCurrentPage = this.store.selectSnapshot(PositionsListState.positions);
    const flatPositionsOnCurrentPage = getFlatPositions(positionsOnCurrentPage);
    const disabledPositions = this.store.selectSnapshot(PositionsListState.disabledPositionsOnPage);
    const selectedPageWithDisabledPositions = flatPositionsOnCurrentPage?.length > 0 && flatPositionsOnCurrentPage?.length === disabledPositions.length;

    return selectedPageWithDisabledPositions
           || checkedPositions.length > 0 && (checkedPositions.length >= flatPositionsOnCurrentPage?.length - disabledPositions?.length)
           || this.useAllPositions;
  }

  // Отправка на согласование
  sendOnApprove = (position: RequestPosition): Observable<RequestPosition> => {
    return this.store.dispatch(new RequestActions.Publish(this.selectedRequest?.id, false, [position.id]));
  }

  // Получаем доступные позиции для создания процедуры
  getAvailablePositionsForProcedure() {
    const checkedGroups = this.store.selectSnapshot(PositionsListState.checkedGroups);
    const availablePositionsDataForCreateProcedureObservable: Observable<RequestPosition[]> = this.positionsService.getAvailablePositionsForCreateProcedure(
      this.filterForm.value,
      this.useAllPositions ? [] : this.store.selectSnapshot(PositionsListState.checkedPositions).map(p => p.id),
      checkedGroups.map(group => group.id),
      this.useAllPositions
    ).pipe(
      shareReplay(),
      catchError(e => {
        this.store.dispatch(new ToastActions.Error(e.error?.detail || 'Произошла ошибка при получении доступных позиций для создания процедуры'));
        return of(e);
      })
    );

    this.availablePositionsForCreateProcedure$ = availablePositionsDataForCreateProcedureObservable.pipe(map((data: any) => data.result));
    this.isWithoutStartPrice$ = availablePositionsDataForCreateProcedureObservable.pipe(map((data: any) => data.isWithoutStartPrice));
  }

  // Выгрузка в Excel
  setRegistryExcelQueue(showModal?: boolean) {
    if (!showModal) {
      this.isExcelInQueue = true;

      const checkedPositions = this.store.selectSnapshot(PositionsListState.checkedPositions).map(pos => pos.id);
      const checkedGroups = this.store.selectSnapshot(PositionsListState.checkedGroups).map(pos => pos.id);

      this.positionsService.setRegistryExcelInQueue(checkedPositions, checkedGroups, this.useAllPositions, this.filterForm.value)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.cdr.detectChanges())
        )
        .subscribe(
          () => {
            this.store.dispatch(new ToastActions.Success(`Запрос на выгрузку в Excel отправлен. Когда запрос будет завершен, вы получите уведомление.`));
            this.isExcelInQueue = false;
            },
          () => {
            this.store.dispatch(new ToastActions.Error(`Не удалось выгрузить Excel`));
            this.isExcelInQueue = false;
          }
        );
    } else {
      this.isExcelInQueue = true;

      this.positionsService.checkRegistryExcelStatus().pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      ).subscribe((queueStatus: any) => {
        this.isExcelInQueue = false;

        if (queueStatus) {
          this.store.dispatch(new ToastActions.Error(`Выполняется ваш предыдущий запрос на формирование выгрузки. Когда запрос будет завершен, вы получите уведомление. Просьба подождать.`));
        } else {
          this.setRegistryExcelModal.open();
        }
      });
    }
  }

  fetchAvailableGroups() {
    this.store.dispatch(new PositionsListActions.FetchAvailableGroups());
  }

  // Расформировать группу
  disbandPositionsGroup(groupId) {
    this.positionsService.disbandPositionsGroup(groupId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cdr.detectChanges())
    ).subscribe(() => {
      this.onModalSuccess();
      this.fetchAvailableGroups();
      this.store.dispatch(new PositionsListActions.SelectAllPositions(false));
    });
  }

  // Коллбек создания группы
  onCreateGroup() {
    this.onModalSuccess();
    this.fetchAvailableGroups();
    this.store.dispatch(new PositionsListActions.SelectAllPositions(false));
  }

  // Вернуть в работу
  returnToWork(checkedPositions: RequestPosition[]) {
    this.positionsService.changePositionsStatus(
      checkedPositions.map(pos => pos.id),
      this.returnToWorkStatus,
      [this.returnToWorkStatusComment],
      this.useAllPositions,
      this.filterForm.value
    )
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cdr.detectChanges())
    ).subscribe(() => {
      this.onModalSuccess();
      this.returnToWorkStatus = this.returnToWorkStatusComment = null;
      this.store.dispatch(new ToastActions.Success(`Позиции возвращены в работу`));
      this.store.dispatch(new PositionsListActions.SelectAllPositions(false));
    }, () => {
      this.store.dispatch(new ToastActions.Error(`Не удалось вернуть позиции в работу`));
    });
  }

  isCheckedPositionsInTheSameProcedure(positions: RequestPosition[]): boolean {
    return positions.every(pos => pos.procedureId && pos.procedureId === positions[0].procedureId && pos.status !== PositionStatus.NEW);
  }

  // Возвращает кол-во позиций вне выбранных групп
  getNotInGroupPositionsLength(): number {
    const checkedGroups = this.store.selectSnapshot(PositionsListState.checkedGroups);
    const checkedPositions = this.store.selectSnapshot(PositionsListState.checkedPositions);
    return checkedPositions.filter((position: RequestPosition) => {
      return !position.groupId || !checkedGroups.find(group => group.id === position.groupId);
    }).length;
  }

  // Возвращает кол-во позиций внутри выбранных групп
  getCheckedGroupPositionsLength(): number {
    const checkedGroups = this.store.selectSnapshot(PositionsListState.checkedGroups);
    return checkedGroups.reduce((sum, group: RequestPosition) => {
      if (group.positionsTotalCount) {
        sum = sum + group.positionsTotalCount;
      }
      return sum;
    }, 0);
  }

  toggleAllPositions() {
    this.useAllPositions = !this.useAllPositions;
    if (!this.useAllPositions) {
      this.store.dispatch(new PositionsListActions.SelectAllPositions(false));
    }
  }

  // Загрузка данных для фильтров
  private loadAdditionalDataForFilters() {
    this.responsibleUsers$ = this.responsibleUsersSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchUsers(q, f?.responsibleUsers ?? []).map(u => ({ label: u.shortName, value: u.id })))
      )),
    );

    this.contragentUsers$ = this.contragentUsersSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchContragents(q, f?.contragentUsers ?? []).map(u => ({ label: u.shortName, value: u.id })))
      )),
    );

    this.positionStatuses$ = this.availableFilters$?.pipe(map(f => f?.positionStatuses.map(
      status => ({ value: status.status, item: status, hideFolded: PositionStatusesFrequent.indexOf(status.status) < 0 })
    )));

    this.procedureRegistryNumbers$ = this.procedureRegistryNumbersSearch$.pipe(
      switchMap(q => this.availableFilters$?.pipe(
        map(f => searchString(q, f?.procedureRegistryNumbers ?? []).map(regNum => ({ value: regNum, label: regNum})))
      ))
    );

    this.requestsNumbers$ = this.requestsNumbersSearch$.pipe(
      switchMap(q => this.availableFilters$?.pipe(
        debounceTime(100),
        map(f => searchString(q, f?.requestsNumbers ?? []).map(regNum => ({ value: regNum, label: regNum})))
      ))
    );
  }

  // Подписка на изменение фильтров
  private subscribeOnFiltersChange() {
    this.fetchFilters$.pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      tap(({ filters }) => {
        if (+this.route.snapshot.queryParams.page > 1 && filters) {
          this.router.navigate(["."], { relativeTo: this.route, queryParams: null });
        }
      }),
      scan(({ filters: prev, sort: prevSort }, { page = 1, filters: curr, sort: currSort }) => {
        const filters = { ...prev, ...curr };

        filters.procedureEndRegistrationDateFrom = filters.procedureEndRegistrationDateFrom
          ? moment(filters.procedureEndRegistrationDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD')
          : null;

        filters.procedureEndRegistrationDateTo = filters.procedureEndRegistrationDateTo
          ? moment(filters.procedureEndRegistrationDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD')
          : null;

        filters.procedureDeliveryDateFrom = filters.procedureDeliveryDateFrom
          ? moment(filters.procedureDeliveryDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD')
          : null;

        filters.procedureDeliveryDateTo = filters.procedureDeliveryDateTo
          ? moment(filters.procedureDeliveryDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD')
          : null;

        return ({ page, filters, sort: { ...prevSort, ...currSort } });

      }, {} as { page?: number, filters?: IPositionsFilters, sort?: IPositionsSort }),
      switchMap(data => this.store.dispatch(
        new PositionsListActions.Fetch((data.page - 1) * this.currentPageSize, this.currentPageSize, data.filters, data.sort)
      )),
    ).subscribe(_ => {
      this.mainCheckbox = false;
      this.useAllPositions = false;
      this.cdr.detectChanges();
    });
  }

}
