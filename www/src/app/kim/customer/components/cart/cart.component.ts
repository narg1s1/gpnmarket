import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import { KimCartItem } from "../../../common/models/kim-cart-item";
import { CartState } from "../../states/cart.state";
import { CartActions } from "../../actions/cart.actions";
import Fetch = CartActions.Fetch;
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { takeUntil, tap } from "rxjs/operators";

@Component({
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  @Select(CartState.cartItems) cartItems$: Observable<KimCartItem[]>;
  @Select(CartState.status) status$: Observable<StateStatus>;

  destroy$ = new Subject();
  constructor(private store: Store, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.store.dispatch(new Fetch());
  }

  deleteItem(item: KimCartItem) {
    this.store.dispatch(new CartActions.DeleteItem(item))
      .pipe(
        tap(takeUntil(this.destroy$)),
      )
      .subscribe(
        () => {},
        (result) => {
          const e = result.error as any;
          this.store.dispatch(e ? new ToastActions.Error(e && e?.error?.detail) : new ToastActions.Success('Позиция удалена из корзины'));
          this.cdr.detectChanges();
        }
      );
  }

  updateItemQuantity(item: KimCartItem, quantity: number) {
    quantity = Math.abs(quantity);
    this.store.dispatch(new CartActions.EditItemQuantity(item, quantity));
  }

  trackByFn(index: number, item: KimCartItem) {
    return item.kimDictionaryPosition?.id || index;
  }
}
