import { PositionStatus } from "../../enum/position-status";
import { ContragentShortInfo } from "../../../../contragent/models/contragent-short-info";
import { User } from "../../../../user/models/user";

export class AvailableFilters {
  positionStatuses: {
    status: PositionStatus,
    count: number
  }[];

  contragents?: ContragentShortInfo[];
  users?: User[];
}
