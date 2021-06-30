import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../../request/common/models/state-status";
import { KimPriceOrder } from "../../common/models/kim-price-order";
import { insertItem, patch } from "@ngxs/store/operators";
import { catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs";
import { PriceOrderActions } from "../actions/price-order.actions";
import { KimPriceOrderService } from "../services/kim-price-order.service";
import Create = PriceOrderActions.Create;
import Fetch = PriceOrderActions.Fetch;

export interface KimRequestStateModel {
  priceOrders: KimPriceOrder[];
  status: StateStatus;
}

type Model = KimRequestStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'KimCustomerPriceOrder',
  defaults: { priceOrders: null, status: "pristine" }
})
@Injectable()
export class PriceOrderState {
  @Selector() static priceOrders({priceOrders}: Model) { return priceOrders; }
  @Selector() static priceOrdersLength({priceOrders}: Model) { return priceOrders.length; }
  @Selector() static status({status}: Model) { return status; }

  constructor(private rest: KimPriceOrderService) {}

  @Action(Fetch)
  fetch(ctx: Context, action: Fetch) {
    ctx.setState(patch({ status: "fetching" } as Model));

    return this.rest.list().pipe(
      this.errorPipe(ctx),
      tap(priceOrders => ctx.setState(patch({priceOrders}))),
      tap(priceOrders => ctx.setState(patch({ status: "received" } as Model)))
    );
  }

  @Action(Create)
  create(ctx: Context, action: Create) {
    ctx.setState(patch({ status: "updating" as StateStatus }));

    return this.rest.create(action.payload).pipe(
      this.errorPipe(ctx),
      tap(priceOrder => ctx.setState(patch({ priceOrders: insertItem(priceOrder) }))),
      tap(() => ctx.setState(patch({ status: "received" as StateStatus })))
    );
  }

  errorPipe(ctx: Context) {
    return catchError(err => {
      ctx.setState(patch({ status: "error" as StateStatus }));
      return throwError(err);
    });
  }
}
