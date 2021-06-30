import { Component } from '@angular/core';
import { merge, Observable, Subject } from "rxjs";
import { Router } from "@angular/router";
import { MessagesService } from "../../services/messages.service";
import { debounceTime, filter, mapTo, take, tap } from "rxjs/operators";
import { ContextsService } from "../../services/contexts.service";
import { ChatContext } from "../../models/chat-context";
import { UserInfoService } from "../../../user/service/user-info.service";
import { ChatMessage } from "../../models/chat-message";

@Component({
  selector: 'app-chat-notification',
  templateUrl: './chat-notification.component.html',
  styleUrls: ['./chat-notification.component.scss']
})
export class ChatNotificationComponent {

  readonly newMessages$ = this.messagesService.onNew().pipe(
    filter(m => m.author.uid !== this.user.getUserInfo().id),
  );
  readonly timer$ = this.newMessages$.pipe(debounceTime(8000), mapTo(null));
  readonly close$ = new Subject();
  readonly message$: Observable<ChatMessage> = merge(this.newMessages$, this.timer$, this.close$);

  constructor(
    private messagesService: MessagesService,
    private contextsService: ContextsService,
    private user: UserInfoService,
    public router: Router,
  ) {
  }

  navigateToContext(contextId: ChatContext["id"]) {
    this.contextsService.get({ contextId }).pipe(take(1), tap(() => this.close$.next()))
      .subscribe(([c]) => this.router.navigate(['/im', JSON.parse(c.items[0].data).contextId]));
  }
}
