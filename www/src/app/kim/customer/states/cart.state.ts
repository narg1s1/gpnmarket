import { StateStatus } from "../../../request/common/models/state-status";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { insertItem, patch } from "@ngxs/store/operators";
import { catchError, tap } from "rxjs/operators";
import { KimCartItem } from "../../common/models/kim-cart-item";
import { CartActions } from "../actions/cart.actions";
import Fetch = CartActions.Fetch;
import { KimCartService } from "../services/kim-cart.service";
import AddItem = CartActions.AddItem;
import { KimPriceOrderPosition } from "../../common/models/kim-price-order-position";
import CreatePriceOrder = CartActions.CreatePriceOrder;
import { throwError } from "rxjs";
import DeleteItem = CartActions.DeleteItem;
import EditItemQuantity = CartActions.EditItemQuantity;

export interface CartStateModel {
  cartItems: KimCartItem[];
  status: StateStatus;
}

type Model = CartStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'Cart',
  defaults: { cartItems: null, status: "pristine" }
})
@Injectable()
export class CartState {
  @Selector() static cartItems({cartItems}: Model) { return cartItems; }
  @Selector() static cartItemsLength({cartItems}: Model) { return cartItems.length; }
  @Selector() static status({ status }: Model) { return status; }

  constructor(private rest: KimCartService) {}

  @Action(Fetch)
  list({setState}: Context, action: Fetch) {
    setState(patch({ status: "fetching" as StateStatus }));

    return this.rest.list().pipe(
      tap(cartItems => setState(patch({ cartItems, status: "received" as StateStatus } )))
    );
  }

  @Action(AddItem)
  addItem({setState}: Context, {item, quantity}: AddItem) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.addItem(item, quantity).pipe(
      tap(cartItems => setState(patch({cartItems, status: "received" as StateStatus})))
    );
  }

  @Action(DeleteItem)
  deleteItem({setState}: Context, {item}: DeleteItem) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.deleteItem(item).pipe(
      tap(cartItems => setState(patch({cartItems, status: "received" as StateStatus})))
    );
  }

  @Action(EditItemQuantity)
  editItem({setState}: Context, {item, quantity}: EditItemQuantity) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.editItem(item, quantity).pipe(
      tap(cartItems => setState(patch({cartItems, status: "received" as StateStatus})))
    );
  }

  @Action(CreatePriceOrder)
  create(ctx: Context, action: CreatePriceOrder) {
    ctx.setState(patch({ status: "fetching" as StateStatus }));

    return this.rest.create(action.payload).pipe(
        this.errorPipe(ctx),
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
