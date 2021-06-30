import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DashboardAvailableFilters } from "../../common/models/dashboard-available-filters";
import { DashboardTasks } from "../../common/models/dashboard-tasks";
import { DashboardProcedures } from "../../common/models/dashboard-procedures";
import { ProceduresAvailableFilters } from "../../../request/back-office/models/procedures-available-filters";

@Injectable()
export class DashboardService {

  constructor(protected api: HttpClient) {
  }

  getTasks() {
    const url = `requests/backoffice/tasks`;
    return this.api.post<DashboardTasks>(url, {});
  }

  getAgreements() {
    const url = `requests/backoffice/tasks/agreements`;
    return this.api.post<DashboardTasks>(url, {});
  }

  getProcedures(filters): Observable<DashboardProcedures>  {
    const url = `requests/backoffice/procedures`;
    return this.api.post<DashboardProcedures>(url, filters);
  }

  getStatusesStatistics(filters = null): Observable<any> {
    const url = `requests/backoffice/dashboard/statistic`;

    return this.api.post<any>(url, { filters });
  }

  getDashboardAvailableFilters(filters = null) {
    const url = `requests/backoffice/dashboard/available-filters`;

    return this.api.post<DashboardAvailableFilters>(url, { filters });
  }

  getDashboardProceduresAvailableFilters(filters = null) {
    const url = `requests/backoffice/procedures/available-filters`;

    return this.api.post<ProceduresAvailableFilters>(url, { filters });
  }
}
