import { Uuid } from "../../../cart/models/uuid";
import { Contragent } from "../../../core/models/contragent";
import { ChatConversation } from "../../../chat/models/chat-conversation";
import { ChatAttachment } from "../../../chat/models/chat-attachment";
import { ChatAuthor } from "../../../chat/models/chat-author";
import { ChatMessage } from "../../../chat/models/chat-message";

export class MessageNotification implements ChatMessage {
  id: number;
  author: ChatAuthor;
  createdAt: string;
  text: string;
  attachments: ChatAttachment[];
  seenAt: string | null;
  status: "sent" | "seen";
  conversation: ChatConversation;

  contragent?: Contragent;
  isSending?: boolean;
  contextType?: string;
  contextId?: Uuid;
  requestId?: Uuid;
}
