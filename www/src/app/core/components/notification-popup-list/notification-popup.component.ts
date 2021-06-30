import {
  Component,
  Inject,
  InjectionToken,
  Input, OnDestroy,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { NotificationsService } from "../../services/notifications.service";
import { animate, sequence, style, transition, trigger } from "@angular/animations";
import { NotificationItem } from "../../models/notifications";
import { take, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  animations: [
    trigger('notificationAnimate', [
      transition(':enter', [
        style({ opacity: 0, marginTop: '-162px' }),
        animate('300ms ease-out', style({ opacity: 1, marginTop: '0px' })),
      ]),
      transition(':leave', [
        sequence([
          style({ opacity: 1 }),
          animate('150ms ease-out', style({ opacity: 0 })),
          animate('150ms ease-out', style({ height: 0 })),
        ])
      ]),
    ])
  ],
  styleUrls: ['./notification-popup.component.scss']
})
export class NotificationPopupComponent implements OnInit, OnDestroy {

  @Input() view: 'popup' | 'list';
  holdNotifications: boolean;
  newNotifications$: Observable<NotificationItem[]> = this.notificationsService.newNotifications$;
  destroy$ = new Subject();

  timerId = setInterval(() => {
    if (!this.holdNotifications) {
      this.hideAllNotifications();
    }
  }, 8000);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
    public notificationsService: NotificationsService,
  ) {}

  ngOnInit() {
    this.hideAllNotifications();

    // Если текущий режим отображения «список» шторки, то при получении новых уведомлений помечаем их как просмотренные
    this.notificationsService.onNew().pipe(
      tap((notification) => {
          if (this.view === 'list' && document.body.classList.contains('notifications-modal-open')) {
            this.notificationsService.markAsRead([notification.id]).pipe(
              take(1),
              takeUntil(this.destroy$)
            ).subscribe(() => this.notificationsService.unreadCount());
          } else {
            // При новом сообщении сбрасываем таймер и заново отсчитываем 5 секунд до исчезновения нотификации
            clearInterval(this.timerId);
            this.timerId = setInterval(() => {
              if (!this.holdNotifications) {
                this.hideAllNotifications();
              }
            }, 8000);
          }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get windowHeight(): number {
    return isPlatformBrowser(this.platformId) ? window.innerHeight : 0;
  }

  /**
   * Возвращает максимальное кол-во всплывающих уведомлений, влезающих в высоту экрана
   */
  get maxPopupCount(): number {
    // todo Высота блока уведомлений на данный момент фиксированная,
    //  поэтому значение для вычисления тоже захардкожено.
    //  Лучше в будущем реализовать универсальное решение для любой высоты блока нотификации
    return Math.floor((this.windowHeight - 50) / 166);
  }

  hideNotification(notification, event = null) {
    if (this.view === 'popup') {
      event?.preventDefault();
      event?.stopPropagation();

      this.notificationsService.notificationAction$.next({ action: 'close', notification });
    }
  }

  hideAllNotifications() {
    if (this.view === 'popup') {
      this.notificationsService.notificationAction$.next({action: 'closeAll'});
    }
  }

  readNotification(notification) {
    this.notificationsService.markAsRead([notification.id]).pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => this.notificationsService.unreadCount());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    clearInterval(this.timerId);
  }
}
