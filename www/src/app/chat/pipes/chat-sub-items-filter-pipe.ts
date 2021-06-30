import { Pipe, PipeTransform } from '@angular/core';
import { ChatSubItem } from "../models/chat-item";

@Pipe({ name: 'subItemsFilter' })
export class ChatSubItemsFilterPipe implements PipeTransform {
  transform(subItems: ChatSubItem[], q: string) {
    return subItems.filter(({ position }) => this.search(position, q));
  }

  search(position, q) {
    return position.name.toLowerCase().indexOf(q?.toLowerCase()) > -1 || position.positions?.some(p => this.search(p, q)) || !q;
  }
}
