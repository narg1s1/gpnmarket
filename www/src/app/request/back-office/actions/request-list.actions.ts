import { RequestsListFilter } from "../../common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../common/models/requests-list/requests-list-sort";

export namespace RequestListActions {
  export class Fetch {
    static readonly type = '[Request List Backoffice] Fetch';
    constructor(public startFrom: number, public pageSize: number, public filters: RequestsListFilter = {}, public sort: RequestsListSort = {}) {}
  }

  export class FetchAvailableFilters {
    static readonly type = '[Request List Backoffice] Fetch Available Filters';
  }
}
