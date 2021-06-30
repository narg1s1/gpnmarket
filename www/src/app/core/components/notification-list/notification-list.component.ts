import { Component, ElementRef, Inject, QueryList, Renderer2, ViewChildren } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Observable, of, Subject } from "rxjs";
import { NotificationItem, Notifications } from "../../models/notifications";
import { NotificationsService } from "../../services/notifications.service";
import { take, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {
  @ViewChildren("notificationCardRef", { read: ElementRef }) notificationCards: QueryList<ElementRef>;

  notifications$: Observable<Notifications>;
  newNotifications$: Observable<NotificationItem[]>;
  openModal = false;
  destroy$ = new Subject();

  notificationsLimit = 30;
  notificationsCount;

  public open() {
    this.notificationsService.getNotifications(this.notificationsLimit).subscribe(notifications => {
      this.notificationsCount = notifications.totalHits;
      this.notifications$ = of(notifications);

      this.markNotificationsAsRead(notifications);

      // Через 2 секунды после открытия шторки визуально помечаем непрочитанные уведомления как прочитанные
      this.notificationCards.changes.subscribe((notificationCards) => {
        notificationCards.filter(card => card.nativeElement.firstChild.classList.contains('not_seen'))
          .forEach((card: ElementRef) => {
            setTimeout(() => { card.nativeElement.firstChild.classList.remove('not_seen'); }, 2000);
          });
      });

      this.renderer.addClass(this.document.body, "aside-modal-open");
      this.renderer.addClass(this.document.body, "notifications-modal-open");
      this.openModal = true;
    });

    this.newNotifications$ = this.notificationsService.newNotifications$;
  }

  public close() {
    this.renderer.removeClass(this.document.body, "aside-modal-open");
    this.renderer.removeClass(this.document.body, "notifications-modal-open");
    this.openModal = false;
  }

  markNotificationsAsRead(notifications) {
    const notificationsIds = [];

    notifications.items
        .filter(item => item.status !== "STATUS_SEEN")
        .map(item => notificationsIds.push(+item.id));

    if (notificationsIds.length > 0) {
      this.notificationsService.markAsRead(notificationsIds).pipe(
        take(1),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.notificationsService.unreadCount();
      });
    }
  }

  // Временный сбособ очищения старых непрочитанных уведомлений:
  // получаем все уведомления, собираем id непросмотренных и отмечаем их как просмотренные
  markAllNotificationsAsRead() {
    const notificationsIds = [];

    this.notificationsService.getNotifications(this.notificationsCount, true).subscribe(notifications => {
      notifications.items
        .map(item => notificationsIds.push(+item.id));

      if (notificationsIds.length > 0) {
        this.notificationsService.markAsRead(notificationsIds).pipe(
          take(1),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.notificationsService.unreadCount();
        });
      }
    });
  }

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, public notificationsService: NotificationsService) {}
}
