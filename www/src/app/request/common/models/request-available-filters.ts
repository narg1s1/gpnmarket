import { PositionStatus } from "../enum/position-status";

export class RequestAvailableFilters {
  positionStatuses: {
    status: PositionStatus,
    count: number
  }[];
  responsibleUsers?: any;
}
