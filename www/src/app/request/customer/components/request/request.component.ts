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
import { RequestActions } from "../../actions/request.actions";
import { RequestState } from "../../states/request.state";
import { StateStatus } from "../../../common/models/state-status";
import { RequestComponent as CommonRequestComponent } from "../../../common/components/request/request.component";
import UploadFromTemplate = RequestActions.UploadFromTemplate;
import Publish = RequestActions.Publish;
import RefreshPositions = RequestActions.RefreshPositions;
import Refresh = RequestActions.Refresh;
import Fetch = RequestActions.Fetch;
import FetchPositions = RequestActions.FetchPositions;
import Approve = RequestActions.Approve;
import PublishPositions = RequestActions.PublishPositions;
import ApprovePositions = RequestActions.ApprovePositions;
import RejectPositions = RequestActions.RejectPositions;
import AttachDocuments = RequestActions.AttachDocuments;
import Reject = RequestActions.Reject;
import CreateTemplate = RequestActions.CreateTemplate;
import { ToastActions } from "../../../../shared/actions/toast.actions";
import EditRequestName = RequestActions.EditRequestName;
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../core/config/gpnmarket-config.interface";
import { RequestsListFilter } from "../../../common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../../common/models/requests-list/requests-list-sort";
import { RequestFilters } from "../../../common/models/request-filters";

@Component({
  templateUrl: './request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent implements OnInit, OnDestroy {
  requestId: Uuid;
  @ViewChild('commonRequestComponent') commonRequestComponent: CommonRequestComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.positions) positions$: Observable<RequestPositionList[]>;
  @Select(RequestState.status) status$: Observable<StateStatus>;
  @Select(RequestState.positionsStatus) positionsStatus$: Observable<StateStatus>;
  @Select(RequestState.totalCount) totalCount$: Observable<number>;
  @Select(RequestState.totalCountWithoutNotRelevantAndCanceled) totalCountWithoutNotRelevantAndCanceled$: Observable<number>;

  readonly fetchFilters$ = new Subject<{page?: number, filters?: RequestsListFilter, sort?: RequestsListSort}>();
  readonly pageSize = this.appConfig.paginator.requestPageSize;
  readonly destroy$ = new Subject();
  readonly refresh = id => new Refresh(id);
  readonly refreshPositions = id => new RefreshPositions(id, 0, 10);
  readonly publish = id => this.store.dispatch(new Publish(id)).subscribe(() => this.fetchFilters$.next({}));
  readonly approve = id => this.store.dispatch(new Approve(id)).subscribe(() => this.fetchFilters$.next({}));
  readonly publishPositions = ({positionIds, useAllPositions}) => this.store.dispatch(new PublishPositions(this.requestId, positionIds, useAllPositions))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly approvePositions = ({positionIds, useAllPositions}) => this.store.dispatch(new ApprovePositions(this.requestId, positionIds, useAllPositions))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly rejectPositions = data => this.store.dispatch(new RejectPositions(this.requestId, data.positionIds, data.rejectionMessage, data.useAllPositions))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly attachDocuments = ({positionIds, files, useAllPositions}) => new AttachDocuments(this.requestId, positionIds, files, useAllPositions);
  readonly saveRequestName = data => new EditRequestName(this.requestId, data);
  readonly reject = id => this.store.dispatch(new Reject(id))
    .subscribe(() => this.fetchFilters$.next({}))
  readonly createTemplate = (positions, title, tag?) => new CreateTemplate(this.requestId, positions.map(position => position.id), title, tag);
  readonly uploadFromTemplate = ({files}) => this.store.dispatch(new UploadFromTemplate(this.requestId, files))
    .subscribe(() => this.fetchFilters$.next({}))
  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    public store: Store,
    private title: Title
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      switchMap(({id}) => this.store.dispatch(new Fetch(id))),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, name}) => this.title.setTitle(name || "Заявка №" + id)),
      tap(({id, number}) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${number}`, link: "/requests/customer/" + id }
      ]),
      takeUntil(this.destroy$),
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(AttachDocuments),
      takeUntil(this.destroy$)
    ).subscribe(({result, action}) => {
      const e = result.error as any;

      const pluralizedFilesTextPart = action.files.length > 1 ? 'Файлы успешно прикреплены ' : 'Файл успешно прикреплён ';
      const pluralizedPositionsTextPart = action.positionIds.length > 1 ? 'к выбранным позициям' : 'к выбранной позиции';
      const text = pluralizedFilesTextPart + pluralizedPositionsTextPart;

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
      switchMap(data => this.store.dispatch(new RefreshPositions(this.requestId, data.page, this.pageSize))),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
