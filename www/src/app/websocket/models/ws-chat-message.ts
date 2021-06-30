import { WsTypes } from "../enum/ws-types";
import { WsChatTypes } from "../enum/ws-chat-types";

export class WsChatMessage<T> {
  type: WsChatTypes;
  data: T;
}

