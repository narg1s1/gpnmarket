import { ChatSubItem } from "../../chat/models/chat-item";
import { StateOperator } from "@ngxs/store";

export function sort(sortFn: (item: ChatSubItem) => boolean): StateOperator<ChatSubItem[]> {
  return (items: Readonly<ChatSubItem[]>) => items.slice().sort((a, b) => sortFn(a) ? -1 : sortFn(b) ? 1 : 0);
}
