import { RequestListItem } from "../../request/common/models/requests-list/requests-list-item";
import { ChatContext } from "./chat-context";
import { ChatConversation } from "./chat-conversation";
import { RequestPositionList } from "../../request/common/models/request-position-list";

export class ChatItem {
  request?: RequestListItem;
  context?: ChatContext;
}

export class ChatSubItem {
  position?: RequestPositionList;
  conversation?: ChatConversation;
}
