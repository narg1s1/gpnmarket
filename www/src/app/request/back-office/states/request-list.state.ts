import { Action, Selector, State, StateContext } from "@ngxs/store";
import { StateStatus } from "../../common/models/state-status";
import { Injectable } from "@angular/core";
import { RequestService } from "../services/request.service";
import { tap } from "rxjs/operators";
import { patch } from "@ngxs/store/operators";
import { RequestListActions } from "../actions/request-list.actions";
import { Page } from "../../../core/models/page";
import { RequestsList } from "../../common/models/requests-list/requests-list";
import { AvailableFilters } from "../models/available-filters";
import { RequestStatusCount } from "../../common/models/requests-list/request-status-count";
import Fetch = RequestListActions.Fetch;
import FetchFilters = RequestListActions.FetchAvailableFilters;

export interface RequestStateStateModel {
  requests: Page<RequestsList>;
  availableFilters: AvailableFilters;
  requestStatusCounts: RequestStatusCount;
  status: StateStatus;
}

type Model = RequestStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'BackofficeRequestList',
  defaults: { requests: null, availableFilters: null, requestStatusCounts: null, status: "pristine" }
})
@Injectable()
export class RequestListState {
  constructor(private rest: RequestService) {}

  @Selector() static requests({requests}: Model) { return requests.entities; }
  @Selector() static statusCounters({requests}: Model) { return requests.statusCounters; }
  @Selector() static totalCount({requests}: Model) { return Object.values(requests.statusCounters).reduce((acc, curr) => acc += curr, 0); }
  @Selector() static tabTotalCount({requests}: Model) { return requests.totalCount; }

  @Selector() static status({status}: Model) { return status; }
  @Selector() static availableFilters({availableFilters}: Model) { return availableFilters; }
  @Selector() static statusCounts({requestStatusCounts}: Model) { return requestStatusCounts; }

  @Action(Fetch, { cancelUncompleted: true }) fetch({setState}: Context, {startFrom, pageSize, filters, sort}: Fetch) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getRequests(startFrom, pageSize, filters, sort).pipe(
      tap(requests => setState(patch({requests, status: "received" as StateStatus}))),
    );
  }

  @Action(FetchFilters) fetchFilters({setState}: Context) {
    return this.rest.availableFilters().pipe(tap(filters => setState(patch({availableFilters: filters}))));
  }
}
