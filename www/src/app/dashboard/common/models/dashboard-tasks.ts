import { RequestPosition } from "../../../request/common/models/request-position";
import { Agreement } from "../../../agreements/common/models/Agreement";
import { DashboardTaskItem } from "./dashboard-task-item";

export class DashboardTasks {
  totalCount: number;
  entities: RequestPosition[] | Agreement[];
  dashboard: DashboardTaskItem[];
}
