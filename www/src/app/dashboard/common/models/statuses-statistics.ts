import { DashboardStatusListItem } from "./dashboard-status-list-item";

export class StatusesStatisticsInfo {
  requestsCount: number;
  positionsCount: number;
  applicantsTasksCount?: number;
  applicantsCount?: number;
  customersCount?: number;
  backofficeTasksCount?: number;
  responsibleUsersCount?: number;
  positionsTotalSumWithoutVat: number;
  currency?: string;
  statusesList: DashboardStatusListItem[];
}
