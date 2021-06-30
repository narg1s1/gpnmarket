import { Injectable } from '@angular/core';
import { WsChatTypes } from "../../websocket/enum/ws-chat-types";
import { WsChatService } from "../../websocket/services/ws-chat.service";
import { Uuid } from "../../cart/models/uuid";
import { ChatConversation } from "../models/chat-conversation";
import { ChatContextTypes } from "../chat-context-types";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class ConversationsService {

  constructor(private ws: WsChatService, private api: HttpClient) {}

  get(conversationId?: number) {
    return this.ws.send<ChatConversation[]>(`conversations.get`, { conversationId });
  }

  create(topic: string, participants: Uuid[], contextId: number) {
    return this.ws.send(`conversations.create`, { topic, participants, contextId });
  }

  addParticipants(newParticipants: Uuid[], conversationId: number) {
    return this.ws.send(`conversations.addParticipants`, { newParticipants, conversationId });
  }

  removeParticipants(participantsToRemove: Uuid[], conversationId: number) {
    return this.ws.send(`conversations.removeParticipants`, { participantsToRemove, conversationId });
  }

  unreadCount(conversationId?: number) {
    return this.ws.send(`conversations.unreadcount`, { conversationId });
  }

  apiCreate(contextType: ChatContextTypes, contextId: Uuid) {
    return this.api.post<{id, externalId}>(`messages/conversation`, { contextType, contextId });
  }

  onNew() {
    return this.ws.on<ChatConversation>(WsChatTypes.CONVERSATIONS_NEW);
  }
}
