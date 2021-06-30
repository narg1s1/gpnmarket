import { PositionStatus } from "../../common/enum/position-status";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";

export class AvailableFilters {
  positionStatuses: {
    status: PositionStatus,
    count: number
  }[];

  contragents: ContragentShortInfo[];
}
