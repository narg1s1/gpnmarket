import { StateStatus } from "../../../request/common/models/state-status";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { DashboardActions } from "../actions/dashboard.actions";
import { patch } from "@ngxs/store/operators";
import { tap } from "rxjs/operators";
import { DashboardService } from "../services/dashboard.service";
import { DashboardTasks } from "../../common/models/dashboard-tasks";
import { StatusesStatisticsInfo } from "../../common/models/statuses-statistics";
import { DashboardAvailableFilters } from "../../common/models/dashboard-available-filters";
import FetchStatusesStatistics = DashboardActions.FetchStatusesStatistics;
import FetchAvailableFilters = DashboardActions.FetchAvailableFilters ;
import Fetch = DashboardActions.Fetch;

export interface DashboardStateModel {
  agreements: DashboardTasks;
  statusesStatistics: StatusesStatisticsInfo;
  availableFilters: DashboardAvailableFilters;
  status: StateStatus;
}

type Model = DashboardStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerDashboard',
  defaults: { agreements: null, statusesStatistics: null, availableFilters: null, status: "pristine" }
})
@Injectable()
export class DashboardState {
  constructor(private rest: DashboardService) {}

  @Selector()
  static agreements({ agreements }: Model) { return agreements.entities; }

  @Selector()
  static agreementsBar({ agreements }: Model) { return agreements.dashboard; }

  @Selector()
  static agreementsTotalCount({ agreements }: Model) { return agreements.totalCount; }

  @Selector()
  static statusesStatistics({ statusesStatistics }: Model) { return statusesStatistics; }

  @Selector()
  static filterRequestList({ availableFilters }: Model) { return availableFilters.requests; }

  @Selector()
  static filterApplicantsList({ availableFilters }: Model) { return availableFilters.applicantUsers; }

  @Selector()
  static status({ status }: Model) { return status; }

  @Action(Fetch) fetchAgreements({setState}: Context) {
    setState(patch({status: "fetching" as StateStatus}));
    return this.rest.getAgreements().pipe(
      tap(agreements => setState(patch({agreements, status: "received" as StateStatus}))),
    );
  }

  @Action(FetchStatusesStatistics)
  fetchStatusesStatistics({ setState, dispatch }: Context, { filters }: FetchStatusesStatistics) {
    setState(patch<Model>({ status: 'fetching' }));

    return this.rest.getStatusesStatistics(filters).pipe(tap(statusesStatistics => setState(patch<Model>({ statusesStatistics, status: "received" }))));
  }

  @Action(FetchAvailableFilters)
  fetchAvailableFilters({ setState, dispatch }: Context, { filters }: FetchAvailableFilters) {
    setState(patch<Model>({ status: 'fetching' }));

    return this.rest.getDashboardAvailableFilters(filters).pipe(tap(availableFilters => {
      setState(patch<Model>({ availableFilters, status: "received" }));
    }));
  }
}
