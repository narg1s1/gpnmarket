import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { PriceOrderActions } from "../../actions/price-order.actions";
import { animate, style, transition, trigger } from "@angular/animations";
import { KimPriceOrder } from "../../../common/models/kim-price-order";
import { PriceOrderState } from "../../states/price-order.state";
import { Observable, Subject } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../core/config/gpnmarket-config.interface";
import { takeUntil } from "rxjs/operators";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import Fetch = PriceOrderActions.Fetch;
import Create = PriceOrderActions.Create;
import Update = PriceOrderActions.Update;
import { Router } from "@angular/router";
import { OkeiService } from "../../../../shared/services/okei.service";
import { UserInfoService } from "../../../../user/service/user-info.service";

@Component({
  templateUrl: './price-order-list.component.html',
  styleUrls: ['./price-order-list.component.scss'],
  animations: [trigger('formHide', [transition(':leave', animate('200ms ease', style({ transform: 'scaleY(0)' })))])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderListComponent implements OnInit, OnDestroy {
  @Select(PriceOrderState.priceOrders) priceOrders$: Observable<KimPriceOrder[]>;
  @Select(PriceOrderState.priceOrdersLength) priceOrdersLength$: Observable<number>;
  @Select(PriceOrderState.status) status$: Observable<StateStatus>;
  showForm = false;
  showFilter = false;
  reviewTabCount = 0;
  progressTabCount = 0;
  reviewedTabCount = 0;
  readonly destroy$ = new Subject();
  readonly folded = [];
  getOrderId = (i, {id}: KimPriceOrder) => id;

  constructor(
    @Inject(APP_CONFIG) public appConfig: GpnmarketConfigInterface,
    private store: Store,
    private actions: Actions,
    private user: UserInfoService,
    public router: Router
  ) { }

  ngOnInit() {
    this.store.dispatch(new Fetch());

    this.actions.pipe(
      ofActionCompleted(Create, Update),
      takeUntil(this.destroy$)
    ).subscribe(({action, result}) => {
      const e = result.error as any;
      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) :
        new ToastActions.Success(`Ценовой запрос успешно отправлен`));
    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canCreatePriceOrder(): boolean {
    return !!this.user.getContragentId();
  }
}
