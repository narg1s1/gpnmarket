import { Uuid } from "../../../cart/models/uuid";

export namespace PriceOrderProposalsActions {
  export class Fetch {
    static readonly type = '[KimCustomerPriceOrderProposals] Fetch';
    constructor(public priceOrderId: Uuid) {
    }
  }

  export class Approve {
    static readonly type = '[KimCustomerPriceOrderProposals] Approve';
    constructor(public priceOrderId: Uuid, public proposalId: Uuid) {
    }
  }

  export class ApproveMultiple {
    static readonly type = '[KimCustomerPriceOrderProposals] ApproveMultiple';
    constructor(public priceOrderId: Uuid, public proposalIds: Uuid[]) {
    }
  }
}
