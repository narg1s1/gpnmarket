import { RequestsListFilter } from "../../common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../common/models/requests-list/requests-list-sort";
import { Uuid } from "../../../cart/models/uuid";

export namespace RequestListActions {
  export class Fetch {
    static readonly type = '[Request List Approver] Fetch';

    constructor(public startFrom: number, public pageSize: number, public filters: RequestsListFilter = {}, public sort: RequestsListSort = {}) {}
  }

  export class FetchAvailableFilters {
    static readonly type = '[Request List Approver] Fetch Available Filters';
  }

  export class Review {
    static readonly type = '[Request List Approver] Review';
    constructor(public approved: boolean, public requestIds: Uuid[], public useAllRequests: boolean, public activeFilters: RequestsListFilter = {}) {}
  }
}
