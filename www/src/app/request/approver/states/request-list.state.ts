import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../common/models/state-status";
import { Page } from "../../../core/models/page";
import { RequestsList } from "../../common/models/requests-list/requests-list";
import { RequestStatusCount } from "../../common/models/requests-list/request-status-count";
import { patch } from "@ngxs/store/operators";
import { tap } from "rxjs/operators";
import { RequestListActions } from "../actions/request-list.actions";
import { RequestService } from "../services/request.service";
import { AvailableFilters } from "../../common/models/requests-list/available-filters";
import Fetch = RequestListActions.Fetch;
import FetchAvailableFilters = RequestListActions.FetchAvailableFilters;
import Review = RequestListActions.Review;

export interface RequestStateStateModel {
  requests: Page<RequestsList>;
  requestStatusCounts: RequestStatusCount;
  availableFilters: AvailableFilters;
  status: StateStatus;
}

type Model = RequestStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'ApproverRequestList',
  defaults: { requests: null, requestStatusCounts: null, availableFilters: null, status: "pristine" }
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

  @Action(Fetch, { cancelUncompleted: true }) fetch({setState}: Context, {startFrom, pageSize, filters, sort}: Fetch) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.list(startFrom, pageSize, filters, sort).pipe(
      tap(requests => setState(patch({requests, status: "received" as StateStatus}))),
    );
  }

  @Action(FetchAvailableFilters) fetchFilters({setState}: Context) {
    return this.rest.availableFilters().pipe(tap(filters => setState(patch({ availableFilters: filters }))));
  }

  @Action(Review) review({setState}: Context, { approved, requestIds, useAllRequests, activeFilters }: Review) {
    setState(patch<Model>({ status: "updating" }));
    return (approved ? this.rest.approve(requestIds, useAllRequests, activeFilters) : this.rest.reject(requestIds, useAllRequests, activeFilters))
      .pipe(tap(() => setState(patch<Model>({ status: 'received' }))));
  }
}
