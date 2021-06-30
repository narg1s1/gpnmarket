import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from "./services/notification.service";
import { NotificationsComponent } from './components/notifications/notifications.component';
import { NotificationRoutingModule } from "./notification-routing.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [NotificationsComponent],
  providers: [NotificationService],
  imports: [
    SharedModule,
    CommonModule,
    NotificationRoutingModule
  ]
})
export class NotificationModule {
}
