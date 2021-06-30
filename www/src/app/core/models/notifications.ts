import { Uuid } from "../../cart/models/uuid";
import { PositionStatus } from "../../request/common/enum/position-status";

export class Notifications {
  items: NotificationItem[];
  limit: string;
  totalHits: string;
}

export class NotificationItem {
  body: NotificationInfo | string;
  channel: number;
  created_at: string;
  distribution_id: number;
  from: string;
  id: number;
  receiver?: string;
  report?: string;
  send_to: string;
  status: string|number;
  title: string;
}

export class NotificationInfo {
  type: string;
  items: NotificationPositionItem[];
  message: string;
  requestId: Uuid;
  requestName: string;
  requestNumber: string;
  requestStatus: string;
  requestStatusLabel: string;
  requestTpPositionStatus?: string;
  requestOfferPositionStatus?: string;
  requestTcpPositionStatus?: string;
  requestContractStatus?: string;
  requestUrl: string;
  webUrl?: string;
  requestPositions?: NotificationPositionInfo[];
  rows?: NotificationPositionList[];
  contragentName?: string;
}

export class NotificationPositionItem {
  requestPositionId: Uuid;
  requestPositionName: string;
  requestPositionStatus: string;
  requestPositionStatusLabel: string;
}

export class NotificationPositionInfo {
  id: Uuid;
  measureUnit: string;
  name: string;
  quantity: string;
  status?: PositionStatus;
  statusLabel?: string;
}

export class NotificationPositionList {
  items: NotificationPositionItem[];
  requestId: Uuid;
  requestName: string;
  requestNumber: string;
  requestStatus: string;
  requestStatusLabel: string;
  requestUrl: string;
  webUrl?: string;
}
