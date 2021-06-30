import { Uuid } from "../../../cart/models/uuid";
import { User } from "../../../user/models/user";
import { ActivityData } from "./history-activity-data";
import { PositionHistoryType } from "../enum/position-history-type";
import { PositionStatus } from "../enum/position-status";

export class History {
  createdDate: string;
  type: PositionHistoryType;
  typeLabel: string;
  data: ActivityData;
  documentId?: string;
  id: Uuid;
  requestContractId?: Uuid;
  requestId: Uuid;
  requestOfferPositionId?: Uuid;
  requestPositionWinnerId?: Uuid;
  requestPositionId: Uuid;
  status?: string;
  statusLabel?: string;
  user?: User;
  request?: {
    id: Uuid
    name: string
    number: number
  };
  requestPosition?: {
    id: Uuid
    name: string
    status: PositionStatus
  };
}
