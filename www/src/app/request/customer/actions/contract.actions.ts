import { Uuid } from "../../../cart/models/uuid";
import { Contract } from "../../common/models/contract";
import { ContractFilter } from "../../common/models/contract-filter";

export namespace ContractActions {
  export class Fetch {
    static readonly type = '[Contract Customer] Fetch';
    constructor(public requestId: Uuid) {}
  }

  export class Filter implements Fetch {
    static readonly type = '[Contract Customer] Filter';
    constructor(public requestId: Uuid, public filter: ContractFilter<Uuid>) {}
  }

  export class FetchAvailibleFilters {
    static readonly type = '[Contract Customer] FetchAvailibleFilters';
    constructor(public requestId: Uuid) {}
  }

  export class Reject {
    static readonly type = '[Contract Customer] Reject';
    constructor(public requestId: Uuid, public contract: Contract, public files?: File[], public comment?: string) {}
  }

  export class Approve {
    static readonly type = '[Contract Customer] Approve';
    constructor(public requestId: Uuid, public contract: Contract) {}
  }

  export class ConfirmWithoutSigning {
    static readonly type = '[Contract Customer] ConfirmWithoutSigning';
    constructor(public requestId: Uuid, public contract: Contract) {}
  }

  export class Upload {
    static readonly type = '[Contract Customer] Upload';
    constructor(public contract: Contract, public files: File[], public comment?: string) {}
  }

  export class Download {
    static readonly type = '[Contract Customer] Download';
    constructor(public contract: Contract) {}
  }

  export class SignDocument {
    static readonly type = '[Contract Customer] SignDocument';
    constructor(public contractId: Uuid, public data: any, public requestId: Uuid) {}
  }
}
