import { ChatConversation } from "./chat-conversation";
import { ChatAttachment } from "./chat-attachment";
import { ChatAuthor } from "./chat-author";

export class ChatMessage {
  id: number;
  attachments: ChatAttachment[];
  author: ChatAuthor;
  conversation: ChatConversation;
  createdAt: string;
  seenAt: string | null;
  status: "sent" | "seen";
  text: string;
}
