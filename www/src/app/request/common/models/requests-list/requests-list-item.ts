import { Uuid } from "../../../../cart/models/uuid";
import { StatusInfo } from "./status-info";
import { DeliveryInfo } from "./delivery-info";
import { Contragent } from "../../../../core/models/contragent";
import { ChatConversation } from "../../../../chat/models/chat-conversation";
import { ChatContext } from "../../../../chat/models/chat-context";
import { User } from "../../../../user/models/user";

export class RequestListItem {
  id: Uuid;
  name?: string;
  number: number;
  status: StatusInfo;
  delivery?: DeliveryInfo;
  type?: string;
  comment?: string;
  contragent?: Contragent;
  publishedDate?: Date;
  conversation?: { id: Uuid, externalId: ChatConversation["id"], unreadCount?: number };
  context?: { id: Uuid, externalId: ChatContext["id"], unreadCount?: number };
  amount?: number;
  user?: User;
}
