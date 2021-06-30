import { UserInfoService } from './../../../../user/service/user-info.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Uuid } from "../../../../cart/models/uuid";
import { RequestComponent as CommonRequestComponent } from "../../../common/components/request/request.component";
import { Actions, Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { Request } from "../../../common/models/request";
import { RequestPositionList } from "../../../common/models/request-position-list";
import { StateStatus } from "../../../common/models/state-status";
import { ActivatedRoute, Router } from "@angular/router";
import { PositionService } from "../../../customer/services/position.service";
import { UxgBreadcrumbsService } from "uxg";
import { Title } from "@angular/platform-browser";
import { filter, scan, switchMap, takeUntil, tap, throttleTime } from "rxjs/operators";
import { RequestActions } from "../../actions/request.actions";
import { RequestState } from "../../states/request.state";
import { PositionStatus } from "../../../common/enum/position-status";
import { PositionFilter } from "../../../common/models/position-filter";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { RequestsListFilter } from "../../../common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../../common/models/requests-list/requests-list-sort";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../core/config/gpnmarket-config.interface";
import { RequestFilters } from "../../../common/models/request-filters";
import Refresh = RequestActions.Refresh;
import RefreshPositions = RequestActions.RefreshPositions;
import Fetch = RequestActions.Fetch;
import { RequestPosition } from "../../../common/models/request-position";

@Component({
  templateUrl: './request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent implements OnInit, OnDestroy {
  requestId: Uuid;
  positionFilter: PositionFilter;
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

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    public router: Router,
    private route: ActivatedRoute,
    private positionService: PositionService,
    private bc: UxgBreadcrumbsService,
    private cd: ChangeDetectorRef,
    private actions: Actions,
    public store: Store,
    private title: Title,
    private userInfoService: UserInfoService
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      switchMap(({id}) => {
        if (!this.route.snapshot.queryParams.showOnlyApproved) {
          this.request$.pipe(filter(request => !!request)).subscribe(request => {
            const onlyApproved = request.proofOfNeedPositionsCount > 0 ? '0' : '1';

            this.positionFilter = onlyApproved === '0' ?
              { "statuses": [PositionStatus.PROOF_OF_NEED]} :
              { "notStatuses": [PositionStatus.PROOF_OF_NEED, PositionStatus.DRAFT, PositionStatus.ON_CUSTOMER_APPROVAL]};

            this.router.navigateByUrl(this.router.url + '?showOnlyApproved=' + onlyApproved);
          });
        } else {
          this.positionFilter = this.route.snapshot.queryParams.showOnlyApproved === '1' ?
            { "notStatuses": [PositionStatus.PROOF_OF_NEED, PositionStatus.DRAFT, PositionStatus.ON_CUSTOMER_APPROVAL]} :
            { "statuses": [PositionStatus.PROOF_OF_NEED]};
        }

        return this.store.dispatch(new Fetch(id));
      }),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, name}) => this.title.setTitle(name || "Заявка №" + id)),
      tap(({id, number}) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/approver" },
        { label: `Заявка №${number}`, link: "/requests/approver/" + id, queryParams: {
          showOnlyApproved: this.route.snapshot.queryParams.showOnlyApproved
        }}
      ]),
      takeUntil(this.destroy$),
    ).subscribe();

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
      switchMap(data => this.store.dispatch(new RefreshPositions(this.requestId, data.page, this.pageSize, this.positionFilter))),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  rejectPositions(positionIds: Uuid[], rejectionMessage: string, useAllPositions: boolean) {
    const newStatus = this.userInfoService.isCustomerApprover()
      ? PositionStatus.DRAFT
      : this.userInfoService.isCustomer()
        ? PositionStatus.CANCELED
        : PositionStatus.NOT_RELEVANT;
    this.positionService.changePositionsStatus(
      this.requestId,
      positionIds,
      newStatus,
      useAllPositions,
      [rejectionMessage]
    )
      .pipe(tap(() => this.fetchFilters$.next({}))).subscribe(() => this.store.dispatch(
        new ToastActions.Success(positionIds.length > 1 ? positionIds.length + ' позиции отклонены' : 'Позиция отклонена')
      ));
  }

  approvePositions(positionIds: Uuid[], useAllPositions: boolean) {
    this.positionService.changePositionsStatus(this.requestId, positionIds, PositionStatus.NEW, useAllPositions)
      .pipe(
        tap(() => this.fetchFilters$.next({}))
      ).subscribe((positions: RequestPosition[]) => {
        const successText = useAllPositions
          ? 'Все позиции успешно согласованы'
          : (positionIds.length > 1) ? positionIds.length + ' позиции успешно согласованы' : 'Позиция успешно согласована';

        // Удаляем обработанные позиции из списка отмеченных
        if (useAllPositions) {
          this.commonRequestComponent.checkedPositions = [];
        } else {
          positions.forEach(position => {
            const positionIndex = this.commonRequestComponent.checkedPositions.findIndex(checkedPosition => checkedPosition.id === position.id);
            this.commonRequestComponent.checkedPositions.splice(positionIndex, 1);
          });
        }

        this.positionsStatus$.pipe(takeUntil(this.destroy$)).subscribe(status => {
          if (status === 'received') {
            this.positions$.subscribe(positionsRecieved => {
              if (!positionsRecieved?.length) {
                const urlTree = this.router.parseUrl(this.router.url);
                urlTree.queryParams = {};

                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.navigate([urlTree.toString()], { queryParams: { showOnlyApproved: 1}});
              }
            });
          }
        });

        return this.store.dispatch(new ToastActions.Success(successText));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
