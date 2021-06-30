import { RequestListItem } from "../../request/common/models/requests-list/requests-list-item";
import { ChatContextTypes } from "../chat-context-types";
import { Uuid } from "../../cart/models/uuid";
import { ChatConversation } from "../models/chat-conversation";

export namespace ChatSubItems {
  export class FetchPositions {
    static readonly type: string = '[ChatSubItems] FetchPositions';

    constructor(public role: "customer" | "backoffice", public request: RequestListItem) {}
  }

  export class Fetch extends FetchPositions {
    static readonly type = '[ChatSubItems] Fetch';
  }

  export class CreateConversation {
    static readonly type = '[ChatSubItems] CreateConversation';

    constructor(public contextType: ChatContextTypes, public contextId: Uuid) {}
  }

  export class AppendConversation {
    static readonly type = '[ChatSubItems] AppendConversation';

    constructor(public conversation: ChatConversation) {}
  }

  export class IncrementUnread {
    static readonly type = '[ChatSubItems] IncrementUnread';

    constructor(public conversation: ChatConversation) {}
  }

  export class MoveToTop {
    static readonly type = '[ChatSubItems] MoveToTop';

    constructor(public id: ChatConversation["id"]) {}
  }

  export class Clear {
    static readonly type = '[ChatSubItems] Clear';
  }
}
