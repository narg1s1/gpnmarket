import { User } from "../../user/models/user";
import { ChatConversation } from "./chat-conversation";

export class ChatContext {
  id: number;
  service: string;
  status: string;
  name: string;
  createdAt: string;
  supervisor: User;
  items: ContextItem[];
  conversations?: ChatConversation[];
  unreadCount: number;
}

export class ContextItem {
  id: number;
  data: string;
}
