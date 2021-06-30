import { WsTypes } from "../enum/ws-types";

export class WsMessage<T> {
  type: WsTypes;
  data: T;
}
