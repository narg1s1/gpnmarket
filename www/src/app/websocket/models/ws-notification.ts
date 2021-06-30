import { WsNotificationTypes } from "../enum/ws-notification-types";

export class WsNotification<T> {
  type: WsNotificationTypes;
  data: T;
}

