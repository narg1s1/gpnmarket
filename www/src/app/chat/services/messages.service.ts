import { Injectable } from '@angular/core';
import { filter } from "rxjs/operators";
import { WsChatTypes } from "../../websocket/enum/ws-chat-types";
import { WsChatService } from "../../websocket/services/ws-chat.service";
import { ChatMessage } from "../models/chat-message";
import { HttpClient } from "@angular/common/http";
import { ChatConversation } from "../models/chat-conversation";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private ws: WsChatService, protected api: HttpClient) {}

  get(conversationId: number, messageId?: number, limit: number = 50, offset: number = 0) {
    return this.ws.send<ChatMessage[]>(`messages.get`, { conversationId, messageId, limit, offset });
  }

  send(text: string, conversationId: number, attachments?: number[]): void {
    this.ws.send(`messages.send`, { text, conversationId, attachments });
  }

  unreadCount() {
    return this.ws.send<{ count: number }>(`messages.unreadcount`);
  }

  markSeen(data: { conversationId?: number, messageId?: number }) {
    return this.ws.send<{ updated: number, read: number }>(`messages.markseen`, data);
  }

  onNew(conversationId?: ChatConversation["id"]) {
    return this.ws.on<ChatMessage>(WsChatTypes.MESSAGES_NEW)
      .pipe(filter(({ conversation: { id } }) => conversationId ? id === conversationId : true));
  }

  onMarkSeen() {
    return this.ws.on<{ updated: number }>(WsChatTypes.MESSAGES_MARKSEEN);
  }

  onMarkedAsRead() {
    return this.ws.on<{conversationId: ChatConversation["id"]}>(WsChatTypes.MESSAGES_MARKEDASREAD);
  }

}
