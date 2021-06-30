import { UserInfoService } from './../../user/service/user-info.service';
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotificationItem, Notifications } from "../models/notifications";
import { map, scan, takeUntil, tap } from "rxjs/operators";
import { WsNotificationsService } from "../../websocket/services/ws-notifications.service";
import { WsNotificationTypes } from "../../websocket/enum/ws-notification-types";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class NotificationsService {

  destroy$ = new Subject();

  readonly notificationAction$ = new BehaviorSubject<{ action: string, notification?: NotificationItem }>(null);

  readonly newNotifications$: Observable<NotificationItem[]> = this.notificationAction$.pipe(
    takeUntil(this.destroy$),
    scan((acc, notificationAction) => {
      const audio = new Audio();
      audio.src = "/assets/new-notification.mp3";
      audio.load();
      if (notificationAction?.notification && notificationAction.action === "add") {
        const i = acc.findIndex(({ id }) => notificationAction.notification?.id === id);
        if (i !== -1) {
          acc[i] = notificationAction.notification;
        } else {
          acc.unshift(notificationAction.notification);
          audio.play();
        }
      } else if (notificationAction?.notification && notificationAction.action === "close") {
        const i = acc.findIndex(({ id }) => notificationAction.notification.id === id);
        i !== -1 ? acc.splice(i, 1) : acc[i] = notificationAction.notification;
      } else if (notificationAction?.action === "closeAll") {
        acc = [];
      }

      return acc;
    }, [])
  );

  constructor(private ws: WsNotificationsService, private api: HttpClient, private userInfoService: UserInfoService) {
    this.listenNotificationActions();
  }

  private listenNotificationActions() {
    this.onNew().pipe(
      tap((notification) => {
        notification.body = JSON.parse(notification.body as string);
        this.notificationAction$.next({ action: 'add', notification });
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.onNotificationRead().subscribe(() => this.unreadCount());
  }

  getNotifications(limit, onlyUnread = false) {
    const url = `#notifications#`;
    const status = onlyUnread ? '3' : '0';

    return this.api.get<Notifications>(url, {params: {limit: limit, channel: '1', status: status}})
      .pipe(map(
        notifications => {
          let filteredItems = notifications.items;
          if (this.userInfoService.isBackofficeObserver()) {
            filteredItems = filteredItems.filter(item => {
              const body = JSON.parse(item.body as string);
              return body.type === 'NEW_REGISTRY_EXCEL';
            });
          }
          notifications.items = filteredItems.map(item => {
            item.body = JSON.parse(item.body as string);
            return item;
          });
          return notifications;
        }
      ));
  }

  list() {
    return this.ws.send<NotificationItem[]>(WsNotificationTypes.NOTIFICATION_GET);
  }

  unreadCount() {
    return this.ws.send<{ unread_count: number }>(WsNotificationTypes.NOTIFICATION_UNREADCOUNT);
  }

  markAsRead(notificationsIds) {
    return this.ws.send<{ items: number[] }>(WsNotificationTypes.NOTIFICATION_READ, { items: notificationsIds });
  }

  onNotificationRead() {
    return this.ws.on<{ items: number[] }>(WsNotificationTypes.NOTIFICATION_READ);
  }

  onNew() {
    return this.ws.on<NotificationItem>(WsNotificationTypes.NOTIFICATION_NEW);
  }

}
