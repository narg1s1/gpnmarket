import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Menu, MenuModel } from "../../models/menu.model";
import { UserInfoService } from "../../../user/service/user-info.service";
import { CartStoreService } from "../../../cart/services/cart-store.service";
import { AuthService } from "../../../auth/services/auth.service";
import { FeatureService } from "../../services/feature.service";
import { MessagesService } from "../../../chat/services/messages.service";
import { distinctUntilChanged, filter, mapTo, switchMap, takeUntil, tap } from "rxjs/operators";
import { BehaviorSubject, fromEvent, iif, interval, merge, Subject } from "rxjs";
import { Title } from "@angular/platform-browser";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../config/gpnmarket-config.interface";
import { NotificationsService } from "../../services/notifications.service";
import { NotificationPopupComponent } from "../notification-popup-list/notification-popup.component";
import { NotificationListComponent } from "../notification-list/notification-list.component";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  @ViewChild('notificationPopupComponent') notificationPopup: NotificationPopupComponent;
  @ViewChild('notificationListComponent') notificationListComponent: NotificationListComponent;
  @Output() openModal = new EventEmitter();

  get menu(): MenuModel[] {
    return [...Menu, ...this.appConfig.menu.additionalItems]
      .filter(item => !item.feature || this.featureService.available(item.feature, this.user.roles));
  }

  readonly unreadMessagesCount$ = new BehaviorSubject<number>(0);
  readonly unreadNotificationsCount$ = new BehaviorSubject<number>(0);
  readonly destroy$ = new Subject();

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    @Inject(DOCUMENT) public document: Document,
    public title: Title,
    public auth: AuthService,
    public user: UserInfoService,
    public cartStoreService: CartStoreService,
    public featureService: FeatureService,
    public messagesService: MessagesService,
    public notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.notificationsService.unreadCount().pipe(takeUntil(this.destroy$))
      .subscribe(({unread_count}) => this.unreadNotificationsCount$.next(unread_count));

    this.notificationsService.onNew().pipe(takeUntil(this.destroy$))
      .subscribe(() => this.notificationsService.unreadCount());

    this.notificationsService.onNotificationRead().pipe(takeUntil(this.destroy$))
      .subscribe(({ items }) => this.unreadNotificationsCount$.next(this.unreadNotificationsCount$.getValue() - items?.length));

    this.messagesService.unreadCount().pipe(takeUntil(this.destroy$))
      .subscribe(({count}) => this.unreadMessagesCount$.next(count));

    this.messagesService.onNew().pipe(
      filter(m => m.author.uid !== this.user.getUserInfo().id),
      takeUntil(this.destroy$)
    ).subscribe(() => this.unreadMessagesCount$.next(this.unreadMessagesCount$.getValue() + 1));

    this.messagesService.onMarkSeen().pipe(takeUntil(this.destroy$))
      .subscribe(({ updated }) => {
        const currentUnreadMessagesCount = this.unreadMessagesCount$.getValue();
        this.unreadMessagesCount$.next(currentUnreadMessagesCount >= updated ? currentUnreadMessagesCount - updated : currentUnreadMessagesCount);
      });

    let title;
    const audio = new Audio();
    audio.src = "/assets/new-message.mp3";
    audio.load();
    merge(
      this.messagesService.onNew().pipe(mapTo(true)),
      fromEvent(document, 'visibilitychange').pipe(mapTo(false))
    ).pipe(
      filter(newMessage => document.visibilityState === 'hidden' === newMessage),
      tap(newMessage => newMessage && audio.play()),
      distinctUntilChanged(),
      tap(newMessage => newMessage ? title = this.title.getTitle() : this.title.setTitle(title ?? this.title.getTitle())),
      switchMap(newMessage => iif(() => newMessage, interval(1000)))
    ).subscribe(i => this.title.setTitle(i % 2 ? title : "Новое сообщение!"));
  }

  get userBriefInfo(): string {
    if (this.user.isCustomer()) {
      return this.user.getUserInfo()?.contragent.shortName;
    }

    if (this.user.isCustomerApprover()) {
      return 'Согласующий';
    }

    if (this.user.isBackOffice()) {
      if (this.user.isBackofficeObserver()) {
        return 'Наблюдатель';
      }

      return 'Бэк-офис';
    }

    if (this.user.isAdmin()) {
      return 'Админ';
    }

    return '';
  }

  openNotificationsModal() {
    this.openModal.emit();
    this.notificationPopup?.hideAllNotifications();
  }

  logout(): void {
    this.auth.logout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
