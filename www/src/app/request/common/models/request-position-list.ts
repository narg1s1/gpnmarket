import { Uuid } from "../../../cart/models/uuid";
import { BaseModel } from "../../../core/models/base-model";
import { Request } from "./request";
import { RequestPositionListEntityType } from "../enum/request-position-list-entity-type";
import { ChatConversation } from "../../../chat/models/chat-conversation";

export class RequestPositionList extends BaseModel {
  /**
   * Значение null допустимо для позиций не сохранённых в базе данных
   */
  id: Uuid|null;
  entityType?: RequestPositionListEntityType;
  conversation?: { id: Uuid, externalId: ChatConversation["id"], unreadCount?: number };
  createdDate: string;
  updatedDate: string;
  positions?: RequestPositionList[];
  request: Request;
  name: string;

  // Technical field
  _selected?: boolean;
  _disabled?: boolean;
}
