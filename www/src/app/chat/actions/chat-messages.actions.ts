import { ChatConversation } from "../models/chat-conversation";
import { ChatMessage } from "../models/chat-message";
import { Uuid } from "../../cart/models/uuid";
import { RequestListItem } from "../../request/common/models/requests-list/requests-list-item";

export namespace ChatMessages {
  export class Clear {
    static readonly type = '[ChatMessages] Clear';
  }

  export class Fetch {
    static readonly type = '[ChatMessages] Fetch';

    constructor(public conversationId: ChatConversation["id"]) {}
  }

  export class New {
    static readonly type = '[ChatMessages] New';

    constructor(public message: ChatMessage) {}
  }

  export class MarkAsRead {
    static readonly type = '[ChatMessages] MarkAsRead';

    constructor(public requestId: RequestListItem["id"], public conversationId: ChatConversation["id"], public updated: number) {}
  }
}
