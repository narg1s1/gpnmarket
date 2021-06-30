import { ChatConversation } from './../models/chat-conversation';
import { RequestsListFilter } from "../../request/common/models/requests-list/requests-list-filter";
import { RequestsListSort } from "../../request/common/models/requests-list/requests-list-sort";
import { ChatContext } from "../models/chat-context";
import { Uuid } from "../../cart/models/uuid";

export namespace ChatItems {

  export class FetchRequests {
    static readonly type: string = '[ChatItems] FetchRequests';

    constructor(
      public role: "customer" | "backoffice",
      public startFrom: number,
      public pageSize: number,
      public filters: RequestsListFilter = {},
      public sort: RequestsListSort = {}
    ) {}
  }

  export class FetchItems extends FetchRequests {
    static readonly type = '[ChatItems] FetchItems';
    startFrom = 0;
    public sort = { orderBy: "chatContexts", sortDirection: "ASC" };
  }

  export class FetchCurrent {
    static readonly type = '[ChatItems] FetchCurrent';

    constructor(public role: "customer" | "backoffice", public id: Uuid) {}
  }

  export class AppendItems extends FetchRequests {
    static readonly type = '[ChatItems] AppendItems';
    public sort = { orderBy: "chatContexts", sortDirection: "ASC" };
  }

  export class FilterRequests extends FetchRequests {
    static readonly type = '[ChatItems] FilterRequests';
  }

  export class UpdateRequest extends FetchRequests {
    static readonly type = '[ChatItems] UpdateRequest';

    constructor(public role: "customer" | "backoffice", public id: Uuid) {
      super(role, 0, 1, { requestIds: [id] });
    }
  }

  export class AppendContexts {
    static readonly type = '[ChatItems] AppendContexts';
    constructor(public contexts: ChatContext[]) {}
  }

  export class IncrementUnread {
    static readonly type = '[ChatItems] IncrementUnread';

    constructor(public conversation: ChatConversation) {}
  }
}
