import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DashboardTasks } from "../../common/models/dashboard-tasks";
import { DashboardAvailableFilters } from "../../common/models/dashboard-available-filters";
import { Observable } from "rxjs";

@Injectable()
export class DashboardService {

  constructor(protected api: HttpClient) {
  }
  getAgreements(filters = null, startFrom: number = 0, pageSize: number = 5) {
    const url = `requests/customer/tasks`;
    return this.api.post<DashboardTasks>(url, {startFrom, pageSize, filters});
  }

  getStatusesStatistics(filters = null): Observable<any> {
    const url = `requests/customer/dashboard/statistic`;
    return this.api.post<any>(url, { filters });
  }

  getDashboardAvailableFilters(filters = null) {
    const url = `requests/customer/dashboard/available-filters`;
    return this.api.post<DashboardAvailableFilters>(url, { filters });
  }
}
