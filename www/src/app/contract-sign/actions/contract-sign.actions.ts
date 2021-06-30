import { Uuid } from "../../cart/models/uuid";

export namespace ContractSignActions {
  // Получить информацию
  export class Fetch {
    static readonly type = '[Contract] Fetch';
    constructor(public contractId: Uuid) {}
  }

  export class SignDocument {
    static readonly type = '[Contract] SignDocument';
    constructor(public contractId: Uuid, public data: any) {}
  }
}
