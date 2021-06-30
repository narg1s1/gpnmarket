export namespace DashboardActions {

  export class Fetch {
    static readonly type = '[Dashboard Customer] Fetch';
    constructor() {}
  }

  export class FetchAgreements {
    static readonly type = '[Dashboard Customer] FetchAgreements';
    constructor() {}
  }

  export class FetchStatusesStatistics {
    static readonly type = '[Dashboard Customer] FetchStatusesStatistics';

    constructor(public filters: any) {}
  }

  export class FetchAvailableFilters {
    static readonly type = '[Dashboard Customer] FetchAvailableFilters';

    constructor(public filters: any) {}
  }
}
