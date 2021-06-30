import { KimDictionaryItem } from "../../common/models/kim-dictionary-item";
import { KimCartItem } from "../../common/models/kim-cart-item";

import { KimPriceOrder } from "../../common/models/kim-price-order";

export namespace CartActions {
  export class Fetch {
    static readonly type = '[Kim Customer Cart] Fetch';
  }

  export class CreatePriceOrder {
    static readonly type = '[Kim Customer Cart] Create Price Order';
    constructor(public payload: Partial<KimPriceOrder>) {}
  }

  export class AddItem {
    static readonly type = '[Kim Customer Cart] AddItem';
    constructor(public item: KimDictionaryItem, public quantity: number) {}
  }

  export class DeleteItem {
    static readonly type = '[Kim Customer Cart] DeleteItem';
    constructor(public item: KimCartItem) {}
  }

  export class EditItemQuantity {
    static readonly type = '[Kim Customer Cart] EditItem';
    constructor(public item: KimCartItem, public quantity: number) {}
  }
}
