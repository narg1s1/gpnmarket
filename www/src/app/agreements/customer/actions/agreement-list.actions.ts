import { AgreementsListFilter } from "../../common/models/agreements-list/agreements-list-filter";
import { Uuid } from "../../../cart/models/uuid";

export namespace AgreementListActions {
  export class Fetch {
    static readonly type = '[Agreement Customer] Fetch';
    constructor(public filters: AgreementsListFilter, public startFrom?: number, public pageSize?: number) {}
  }

  export class Rate {
    static readonly type = '[Agreement Customer] Rate';
    constructor(public requestId: Uuid, public positionId: Uuid, public rating: number) {}
  }
}
