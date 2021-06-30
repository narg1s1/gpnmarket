import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from "../../services/notification.service";
import { Observable, of, Subscription } from "rxjs";
import { NotificationsResponse } from "../../models/notifications-response";
import { finalize, map, publishReplay, refCount } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationsResponse>;
  total$: Observable<number>;
  pageSize = 10;
  isLoading = false;
  subscription = new Subscription();
  pages$: Observable<number>;

  constructor(private notifications: NotificationService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
  }

  getNotifications(page: number) {
    this.isLoading = true;
    return this.notifications.getNotifications((page - 1) * this.pageSize, this.pageSize).pipe(
      publishReplay(1), refCount(),
      finalize(() => this.isLoading = false)
    );
  }

  loadPage(page: number) {
    if (!this.notifications$) {
      this.notifications$ = this.getNotifications(page);
    } else {
      this.subscription.add(
        this.getNotifications(page).subscribe(data => this.notifications$ = of(data))
      );
    }

    if (!this.total$) {
      this.total$ = this.notifications$.pipe(map(data => data.totalCount));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
