import { PositionStatus } from "../enum/position-status";
import { Uuid } from "../../../cart/models/uuid";

export class RequestFilters {
  positionNameOrNumber?: string;
  responsibleUserIds?: Uuid[];
  positionStatuses?: PositionStatus[];
  isOnlyNotInTcpGroup?: boolean;
  isOnlyNotInProcedure?: boolean;
}
