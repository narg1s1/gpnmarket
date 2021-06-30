import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { Request } from "../../../common/models/request";
import { RequestPositionList } from "../../../common/models/request-position-list";
import { RequestService } from "../../services/request.service";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, scan, switchMap, takeUntil, tap, throttleTime } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { UxgBreadcrumbsService } from "uxg";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { Uuid } from "../../../../cart/models/uuid";
import { RequestPosition } from "../../../common/models/request-position";
import { RequestActions } from "../../actions/request.actions";
import { RequestState } from "../../states/request.state";
import { StateStatus } from "../../../common/models/state-status";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { RequestComponent as CommonRequestComponent } from "../../../common/components/request/request.component";
import { PositionService } from "../../services/position.service";
import { FormBuilder } from "@angular/forms";
import { AvailableFilters } from "../../models/available-filters";
import { RequestsListFilter } from "../../../common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../../common/models/requests-list/requests-list-sort";
import { RequestFilters } from "../../../common/models/request-filters";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../core/config/gpnmarket-config.interface";
import { RequestGroup } from "../../../common/models/request-group";
import { PositionStatus } from "../../../common/enum/position-status";
import UploadFromTemplate = RequestActions.UploadFromTemplate;
import Publish = RequestActions.Publish;
import RefreshPositions = RequestActions.RefreshPositions;
import Refresh = RequestActions.Refresh;
import Fetch = RequestActions.Fetch;
import AttachDocuments = RequestActions.AttachDocuments;
import EditRequestName = RequestActions.EditRequestName;
import ChangeResponsibleUser = RequestActions.ChangeResponsibleUser;
import ChangeResponsibleUserPositions = RequestActions.ChangeResponsibleUserPositions;
import FetchAvailableFilters = RequestActions.FetchAvailableFilters;
import FetchGroups = RequestActions.FetchGroups;
import FetchProcedureCreationPositions = RequestActions.FetchProcedureCreationPositions;

@Component({
  templateUrl: './request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent implements OnInit, OnDestroy {
  requestId: Uuid;
  positions: RequestPosition[];
  @ViewChild('commonRequestComponent') commonRequestComponent: CommonRequestComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.positions) positions$: Observable<RequestPositionList[]>;
  @Select(RequestState.procedureCreationPositions) procedureCreationPositions$: Observable<RequestPositionList[]>;
  @Select(RequestState.status) status$: Observable<StateStatus>;
  @Select(RequestState.positionsStatus) positionsStatus$: Observable<StateStatus>;
  @Select(RequestState.availableFilters) availableFilters$: Observable<AvailableFilters>;
  @Select(RequestState.totalCount) totalCount$: Observable<number>;
  @Select(RequestState.totalCountWithoutNotRelevantAndCanceled) totalCountWithoutNotRelevantAndCanceled$: Observable<number>;
  @Select(RequestState.isWithoutStartPrice) isWithoutStartPrice$: Observable<boolean>;
  @Select(RequestState.groups) groups$: Observable<RequestGroup[]>;

  readonly filterForm = this.fb.group({
    positionNameOrNumber: '',
    positionStatuses: [[]],
    responsibleUserIds: [[]],
    onlyWithoutResponsibleUser: false
  });

  readonly pageSize = this.appConfig.paginator.requestPageSize;
  readonly fetchFilters$ = new Subject<{page?: number, filters?: RequestsListFilter, sort?: RequestsListSort}>();
  readonly destroy$ = new Subject();
  readonly refresh = id => new Refresh(id);
  readonly changeResponsibleUser = (requestId: Uuid, userId: Uuid) => this.store.dispatch(new ChangeResponsibleUser(requestId, userId))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly changeResponsibleUserPositions = (requestId: Uuid, userId: Uuid, positions: RequestPosition[], useAllPositions, filters) => {
    this.store.dispatch(new ChangeResponsibleUserPositions(requestId, userId, positions.map(({ id }) => id), useAllPositions, filters))
      .subscribe(() => this.fetchFilters$.next({}));
  }

  readonly saveRequestName = data => new EditRequestName(this.requestId, data);
  readonly attachDocuments = ({positionIds, files, useAllPositions, activeFilters}) => new AttachDocuments(this.requestId, positionIds, files, useAllPositions, activeFilters);
  readonly publish = (id, positions) => this.store.dispatch(new Publish(id, true, positions.map(position => position.id)))
    .subscribe(() => this.fetchFilters$.next({}))

  readonly uploadFromTemplate = ({files}) => this.store.dispatch(new UploadFromTemplate(this.requestId, files))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly fetchGoups = () => new FetchGroups(this.requestId);
  readonly sendOnApprove = (position: RequestPosition): Observable<RequestPosition> => this.store
    .dispatch(new Publish(this.requestId, false, [position.id])).pipe(
      switchMap(() => this.positionService.info(this.requestId, position.id))
    )

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    public store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private positionService: PositionService,
    private bc: UxgBreadcrumbsService,
    private title: Title,
    private actions: Actions,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      switchMap(({id}) => this.store.dispatch([
        new Fetch(id),
        new FetchGroups(id)
      ])),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, name}) => this.title.setTitle(name || "Заявка №" + id)),
      tap(({id, number}) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/backoffice" },
        { label: `Заявка №${number}`, link: "/requests/backoffice/" + id }
      ]),
      takeUntil(this.destroy$),
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(Publish, AttachDocuments),
      takeUntil(this.destroy$)
    ).subscribe(({result, action}) => {
      const e = result.error as any;
      let text = "";

      if (action instanceof Publish) {
        text = action.positions.length > 1 ? action.positions.length + ' позиции отправлено на согласование' : 'Позиция отправлена на согласование';
      } else if (action instanceof AttachDocuments) {
        const pluralizedFilesTextPart = action.files.length > 1 ? 'Файлы успешно прикреплены ' : 'Файл успешно прикреплён ';
        const pluralizedPositionsTextPart = action.positionIds.length > 1 ? 'к выбранным позициям' : 'к выбранной позиции';
        text = pluralizedFilesTextPart + pluralizedPositionsTextPart;
      }

      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) :
        new ToastActions.Success(text)
      );

      this.commonRequestComponent.resetSelectedPositions();
    });

    this.fetchFilters$.pipe(
      throttleTime(100),
      tap(({ page, filters }) => {
        if (!page && filters) {
          this.router.navigate(["."], { relativeTo: this.route, queryParams: null });
        }
      }),
      scan(({ filters: prev, page: prevPage = 1 }, { page, filters: curr }) => {
        return ({ page: page || (curr ? 1 : prevPage), filters: { ...prev, ...curr } });
      }, { filters: {} } as { page?: number, filters?: RequestFilters }),
      switchMap(data => this.store.dispatch([
        new RefreshPositions(this.requestId, data.page, this.pageSize, data.filters)
      ])),
      takeUntil(this.destroy$)
    ).subscribe();

    this.store.dispatch(new FetchAvailableFilters(this.requestId));
  }

  fetchProcedureCreationPositions(query?: string) {
    return new FetchProcedureCreationPositions(
      this.requestId, 1, this.pageSize,
      {
        positionNameOrNumber: query,
        positionStatuses: [PositionStatus.NEW, PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION],
        isOnlyNotInTcpGroup: true
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
