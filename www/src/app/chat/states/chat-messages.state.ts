import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { append, patch } from "@ngxs/store/operators";
import { take, tap } from "rxjs/operators";
import { ContextsService } from "../services/contexts.service";
import { MessagesService } from "../services/messages.service";
import { ConversationsService } from "../services/conversations.service";
import { ChatMessage } from "../models/chat-message";
import { ChatMessages } from "../actions/chat-messages.actions";
import Fetch = ChatMessages.Fetch;
import Clear = ChatMessages.Clear;
import New = ChatMessages.New;

export interface MessagesStateModel {
  messages: ChatMessage[];
}

type Model = MessagesStateModel;
type Ctx = StateContext<Model>;

@State<Model>({
  name: 'ChatMessages',
  defaults: { messages: []}
})
@Injectable()
export class ChatMessagesState {
  constructor(
    private contextService: ContextsService,
    private conversationsService: ConversationsService,
    private messagesService: MessagesService
  ) {}

  @Selector() static messages({ messages }: Model) { return messages; }

  @Action(Fetch)
  fetchMessages({ setState, dispatch }: Ctx, { conversationId }: Fetch) {
    return this.messagesService.get(conversationId).pipe(
      take(1),
      tap(messages => setState(patch({ messages })))
    );
  }

  @Action(Clear)
  clearMessages({ setState }: Ctx) {
    return setState(patch({ messages: [] } as Model));
  }

  @Action(New)
  newMessage({ setState }: Ctx, { message }: New) {
    return setState(patch({ messages: append([message]) }));
  }
}
