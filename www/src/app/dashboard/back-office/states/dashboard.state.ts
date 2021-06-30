import { StateStatus } from "../../../request/common/models/state-status";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { DashboardActions } from "../actions/dashboard.actions";
import FetchTasks = DashboardActions.FetchTasks;
import { patch } from "@ngxs/store/operators";
import { tap } from "rxjs/operators";
import { DashboardService } from "../services/dashboard.service";
import { DashboardTasks } from "../../common/models/dashboard-tasks";
import { StatusesStatisticsInfo } from "../../common/models/statuses-statistics";
import FetchAgreements = DashboardActions.FetchAgreements;
import FetchProcedures = DashboardActions.FetchProcedures;
import FetchStatusesStatistics = DashboardActions.FetchStatusesStatistics;
import FetchAvailableFilters = DashboardActions.FetchAvailableFilters ;
import { DashboardAvailableFilters } from "../../common/models/dashboard-available-filters";
import { DashboardProcedures } from "../../common/models/dashboard-procedures";
import FetchProceduresAvailableFilters = DashboardActions.FetchProceduresAvailableFilters;
import { ProceduresAvailableFilters } from "../../../request/back-office/models/procedures-available-filters";

export interface DashboardStateModel {
  tasks: DashboardTasks;
  procedures: DashboardProcedures;
  agreements: DashboardTasks;
  statusesStatistics: StatusesStatisticsInfo;
  availableFilters: DashboardAvailableFilters;
  proceduresAvailableFilters: ProceduresAvailableFilters;
  status: StateStatus;
}

type Model = DashboardStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'BackofficeDashboard',
  defaults: {
    tasks: null,
    procedures: null,
    agreements: null,
    statusesStatistics: null,
    availableFilters: null,
    proceduresAvailableFilters: null,
    status: "pristine"
  }
})
@Injectable()
export class DashboardState {
  constructor(private rest: DashboardService) {}

  @Selector()
  static agreements({ agreements }: Model) { return agreements.entities; }

  @Selector()
  static tasks({ tasks }: Model) { return tasks.entities; }

  @Selector()
  static procedures({ procedures }: Model) { return procedures.procedures; }

  @Selector()
  static tasksBar({ tasks }: Model) { return tasks.dashboard; }

  @Selector()
  static agreementsBar({ agreements }: Model) { return agreements.dashboard; }

  @Selector()
  static tasksTotalCount({ tasks }: Model) { return tasks.totalCount; }

  @Selector()
  static proceduresTotalCount({ procedures }: Model) { return procedures.totalCount; }

  @Selector()
  static agreementsTotalCount({ agreements }: Model) { return agreements.totalCount; }

  @Selector()
  static statusesStatistics({ statusesStatistics }: Model) { return statusesStatistics; }

  @Selector()
  static filterRequestList({ availableFilters }: Model) { return availableFilters.requests; }

  @Selector()
  static filterCustomerList({ availableFilters }: Model) { return availableFilters.customers; }

  @Selector()
  static filterResponsibleUsersList({ availableFilters }: Model) { return availableFilters.responsibleUsers; }

  @Selector()
  static proceduresAvailableFilters({ proceduresAvailableFilters }: Model) { return proceduresAvailableFilters; }

  @Selector()
  static proceduresFilterAvailableOkpd2List({ proceduresAvailableFilters }: Model) { return proceduresAvailableFilters.okpd2; }

  @Selector()
  static proceduresFilterAvailableStatusesList({ proceduresAvailableFilters }: Model) { return proceduresAvailableFilters.status; }

  @Selector()
  static proceduresFilterAvailableContragentList({ proceduresAvailableFilters }: Model) { return proceduresAvailableFilters.contragents; }

  @Selector()
  static proceduresFilterAvailableUserList({ proceduresAvailableFilters }: Model) { return proceduresAvailableFilters.users; }

  @Selector()
  static status({ status }: Model) { return status; }

  @Action(FetchTasks) fetchTasks({setState}: Context) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getTasks().pipe(
      tap(tasks => setState(patch({ tasks, status: "received" as StateStatus }))),
    );
  }

  @Action(FetchAgreements) fetchAgreements({setState}: Context) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getAgreements().pipe(
      tap(agreements => setState(patch({ agreements, status: "received" as StateStatus }))),
    );
  }

  @Action(FetchProcedures) fetchProcedures({setState}: Context, { filters, clearState }: FetchProcedures) {
    if (clearState) {
      setState(patch({ procedures: null, status: "fetching" as StateStatus }));
    }

    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getProcedures(filters).pipe(
      tap(procedures => setState(patch({ procedures, status: "received" as StateStatus }))),
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

  @Action(FetchProceduresAvailableFilters)
  fetchProceduresAvailableFilters({ setState, dispatch }: Context, { filters }: FetchProceduresAvailableFilters) {
    setState(patch<Model>({ status: 'fetching' }));

    return this.rest.getDashboardProceduresAvailableFilters(filters).pipe(tap(proceduresAvailableFilters => {
      setState(patch<Model>({ proceduresAvailableFilters, status: "received" }));
    }));
  }
}
