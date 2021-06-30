import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { ChatItemsState } from "../../states/chat-items.state";
import { combineLatest, EMPTY, fromEvent, iif, merge, Observable, of, Subject } from "rxjs";
import { RequestListItem } from "../../../request/common/models/requests-list/requests-list-item";
import { UserInfoService } from "../../../user/service/user-info.service";
import { debounceTime, delayWhen, distinctUntilChanged, filter, flatMap, map, skipUntil, switchMap, take, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { ChatItem, ChatSubItem } from "../../models/chat-item";
import { ChatItems } from "../../actions/chat-items.actions";
import { RequestPositionList } from "../../../request/common/models/request-position-list";
import { RequestPosition } from "../../../request/common/models/request-position";
import { RequestGroup } from "../../../request/common/models/request-group";
import { PositionStatusesLabels } from "../../../request/common/dictionaries/position-statuses-labels";
import { ChatMessage } from "../../models/chat-message";
import { MessagesService } from "../../services/messages.service";
import { ChatContextTypes } from "../../chat-context-types";
import { ChatConversation } from "../../models/chat-conversation";
import { ConversationsService } from "../../services/conversations.service";
import { ChatMessagesState } from "../../states/chat-messages.state";
import { ChatSubItemsState } from "../../states/chat-sub-items.state";
import { ChatAttachment } from "../../models/chat-attachment";
import { ChatMessages } from "../../actions/chat-messages.actions";
import { ChatSubItems } from "../../actions/chat-sub-items.actions";
import { FormControl } from "@angular/forms";
import { StateStatus } from "../../../request/common/models/state-status";
import { AttachmentsService } from "../../services/attachments.service";

@Component({
  styleUrls: ['./chat-context-view.component.scss'],
  templateUrl: './chat-context-view.component.html'
})
export class ChatContextViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer: ElementRef;
  @ViewChildren('messageEl') messageElements: QueryList<ElementRef>;
  @Select(ChatSubItemsState.subItems()) subItems$: Observable<ChatSubItem[]>;
  @Select(ChatSubItemsState.status) subItemsStatus$: Observable<StateStatus>;
  @Select(ChatMessagesState.messages) messages$: Observable<ChatMessage[]>;
  readonly item$: Observable<ChatItem> = this.route.params.pipe(switchMap(({ requestId }) => this.store.select(ChatItemsState.item(requestId))));
  readonly request$: Observable<RequestListItem> = this.item$.pipe(filter(item => !!item?.request), map(({ request }) => request));
  readonly position$: Observable<RequestPositionList> = this.route.queryParams.pipe(switchMap(
    ({ positionId }) => this.store.select(ChatSubItemsState.position(positionId))
  ));

  conversationId: ChatConversation["id"]; // ID Текущего чата
  scrollDirty = false; // Если true - скроллим плавно
  conversationLoading: boolean;
  allPositionsAreDrafts$: Observable<boolean>;

  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly destroy$ = new Subject();
  readonly search = new FormControl();

  get role() {
    return this.userInfoService.getUserRole();
  }

  get urlRole(): 'customer' | 'approver' | 'backoffice' {
    return this.userInfoService.isBackOffice() ? 'backoffice' :
           this.userInfoService.isCustomerApprover() ? 'approver' : 'customer';
  }

  get unreadCountContext$(): Observable<number> {
    return this.item$.pipe(
      filter(item => !!item),
      skipUntil(this.subItemsStatus$.pipe(filter(status => status === "received"))),
      withLatestFrom(this.subItems$),
      map(([item, subItems]) => {
        // Выбираем обсуждение заявки
        return item.context?.conversations.find(conversation => conversation.topic === item.context.name)?.unreadCount || 0;
      }),
    );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    public attachmentsService: AttachmentsService,
    public userInfoService: UserInfoService,
    public messagesService: MessagesService,
    public conversationsService: ConversationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.messageElements.changes.pipe(filter(e => e.length)).subscribe(() => this.scroll());
  }

  ngOnInit(): void {
    this.item$.pipe(debounceTime(0), filter(item => !item), takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(new ChatItems.FetchCurrent(this.userInfoService.getUserRole(), this.route.snapshot.params.requestId));
    });

    combineLatest([this.request$, this.position$]).pipe( // Эмитит при переходе по любому чату
      delayWhen(() => this.subItemsStatus$.pipe(filter(v => v === 'received'))),
      debounceTime(0), // Фикс двойного эмита при переходе из позици другую заявку
      map(([request, position]) => position ?? request),
      distinctUntilChanged((a, b) => a?.id === b?.id), // Если id позиции/заявки чата не поменялся ничего не делаем
      map(item => this.conversationId = item.conversation?.externalId), // Проставляем текущий conversation id
      filter(conversationId => !!conversationId), // Не загружаем сообщения, если conversation не создан
      tap(() => this.scrollDirty = false), // Сбрасываем плавность скролла
      tap(conversationId => this.store.dispatch(new ChatMessages.Fetch(conversationId))), // Загружаем сообщения
      delayWhen(conversationId => this.messagesService.markSeen({ conversationId }).pipe( // Помечаем чат прочитанным
        take(1),
        tap(({ read }) => this.store.dispatch(new ChatMessages.MarkAsRead(this.route.snapshot.params.requestId, conversationId, read))),
      )),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cdr.detectChanges();
    });

    // Очищаем сообщения при переходах
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.store.dispatch(new ChatMessages.Clear()));

    // Загружаем позици при смене заявки
    this.request$.pipe(distinctUntilChanged((a, b) => a?.id === b?.id), takeUntil(this.destroy$)).subscribe(
      request => this.store.dispatch(new ChatSubItems.Fetch(this.role, request)),
    );

    this.allPositionsAreDrafts$ = this.subItems$.pipe(
      map(subItems => subItems.length && subItems.every(({ position }) => this.asPosition(position)?.status === 'DRAFT'))
    );

    this.listenConversations();
    this.listenMessages();
  }

  private listenMessages() {
    this.messagesService.onNew().pipe(
      // Дожидаемся пока у чата появится ин-фа о конверсейшене (сработает сразу если инфа уже есть)
      delayWhen(({ conversation: { id, context: { id: contextId } } }) => merge(
          this.store.select(ChatSubItemsState.subItems(true)),
          this.store.select(ChatItemsState.items)
        ).pipe(
          filter((items) => items.some(value => {
            const item: ChatItem = value?.request?.conversation && value;
            const subItem: ChatSubItem = value?.conversation && value;

            if (item) {
              return item.request.conversation.externalId === id;
            }

            if (subItem) {
              // Учитываем что в созданных конверсейшенах приходит полный объект контекста, при загрузке списка только его id
              return (subItem.conversation.contextId ?? subItem.conversation.context.id) !== contextId || subItem.conversation?.id === id;
            }
          })),
          take(1)
        )
      ),
      tap(({ conversation }) => {
        const { requestId = null, positionId = null } = { ...this.route.snapshot.params, ...this.route.snapshot.queryParams };
        // Если сообщение пришло в только что созданный чат проставляем conversationId
        if (!positionId && this.store.selectSnapshot(ChatItemsState.conversationId(requestId)) === conversation.id) {
          this.conversationLoading = false;
          this.conversationId = conversation.id;
        }

        if (positionId && this.store.selectSnapshot(ChatSubItemsState.conversationId(positionId)) === conversation.id) {
          this.conversationLoading = false;
          this.conversationId = conversation.id;
        }

        // Инкрементим счетчик непрочитанных если сообщение пришло в неактивный чат
        if (conversation && this.conversationId !== conversation.id) {
          this.store.dispatch(
            // Инкрементим unreadCount обсуждения заявки (1) или конкретной позиции заявки (2)
            (conversation.context.name === conversation.topic)
              ? new ChatItems.IncrementUnread(conversation)
              : [new ChatItems.IncrementUnread(conversation), new ChatSubItems.IncrementUnread(conversation)]
          );
        }

        this.store.dispatch(new ChatSubItems.MoveToTop(conversation.id)); // Поднимаем чат наверх
      }),

      // Добавляем сообщение в чат, если чат активен
      filter(({ conversation: { id } }) => this.conversationId === id),
      tap(message => this.store.dispatch(new ChatMessages.New(message))),

      // Прочитываем сообщение
      filter(m => !this.isOwn(m)), // Если оно не наше
      // Если вкладка браузера открыта читаем сразу, если нет - ждём
      delayWhen(() => document.visibilityState === 'visible' ? EMPTY :
        fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'))
      ),
      delayWhen(({ id }) => this.messagesService.markSeen({ messageId: id }).pipe(take(1))),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private listenConversations() {
    this.conversationsService.onNew().pipe(
      delayWhen((conversation) => {
        const { contextId } = JSON.parse(conversation.context.items[0].data);

        return this.store.dispatch([
          new ChatItems.AppendContexts([conversation.context]),
          new ChatItems.UpdateRequest(this.role, contextId)
        ]);
      }),
      withLatestFrom(this.request$),
      tap(([conversation, request]) => {
        const { contextId } = JSON.parse(conversation.context.items[0].data);
        if (contextId === request.id) {
          this.store.dispatch(new ChatSubItems.FetchPositions(this.role, request)).pipe(
            switchMap(() => this.store.dispatch(new ChatSubItems.AppendConversation(conversation)))
          ).subscribe();
        }

      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private scroll() {
    const el: HTMLDivElement = this.messagesContainer.nativeElement;
    el.scroll({ top: el.scrollHeight, left: 0, behavior: this.scrollDirty ? 'smooth' : 'auto' });
    this.scrollDirty = true;
  }

  send({ text, attachments }: { text: string, attachments: ChatAttachment[] }) {
    const { requestId = null, positionId = null } = { ...this.route.snapshot.params, ...this.route.snapshot.queryParams };
    this.conversationLoading = !this.conversationId;

    iif(() => !this.conversationId,
      iif(() => positionId,
        this.position$.pipe(flatMap(position => this.conversationsService.apiCreate(
          this.asPosition(position) ? ChatContextTypes.REQUEST_POSITION : ChatContextTypes.REQUEST_GROUP, positionId
        ))),
        this.conversationsService.apiCreate(ChatContextTypes.REQUEST, requestId)
      ).pipe(map(({ externalId }) => externalId), take(1)),
      of(this.conversationId)
    ).subscribe((convId) => this.messagesService.send(text, convId, attachments.map(({ id }) => id)));
  }

  subItemsByGroup$(id: RequestGroup["id"]): Observable<ChatSubItem[]> {
    return this.store.select(ChatSubItemsState.subItemsByGroup(id));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  asPosition = (position: RequestPositionList) => position instanceof RequestPosition && position;
  asGroup = (position: RequestPositionList) => position instanceof RequestGroup && position;
  trackById = (i, { id }) => id;
  isOwn = ({ author }: ChatMessage) => author.uid === this.userInfoService.getUserInfo().id;
}
