import { KimPriceOrder } from "../../common/models/kim-price-order";
import { Uuid } from "../../../cart/models/uuid";

export namespace PriceOrderActions {
  export class Fetch {
    static readonly type = '[KimCustomerPriceOrder] Fetch';
  }

  export class Create {
    static readonly type = '[KimCustomerPriceOrder] Create Request';
    constructor(public payload: Partial<KimPriceOrder>) {}
  }

  export class Update {
    static readonly type = '[KimCustomerPriceOrder] Update Request';
    constructor(public payload: Partial<KimPriceOrder> & {id: Uuid}) {}
  }
}
