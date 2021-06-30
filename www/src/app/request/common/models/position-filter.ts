import { PositionStatus } from "../enum/position-status";

export class PositionFilter {
  notStatuses?: PositionStatus[];
  statuses?: PositionStatus[];
}
