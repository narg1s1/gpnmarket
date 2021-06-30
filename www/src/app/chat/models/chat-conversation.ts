import { User } from "../../user/models/user";
import { ChatContext } from "./chat-context";

export class ChatConversation {
  id: number;
  topic: string;
  createdAt: string;
  participants: User[];
  context?: ChatContext; // В conversations.new
  contextId?: number; // В conversations.get (если список)
  unreadCount: number;
}
