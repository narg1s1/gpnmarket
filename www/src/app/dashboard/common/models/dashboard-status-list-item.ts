import { PositionStatus } from "../../../request/common/enum/position-status";

export class DashboardStatusListItem {
  status: PositionStatus;
  statusGroupName: string;
  quantityPercentage: number;
  quantity: number;
  sumPercentage: number;
  sum: number;
}
