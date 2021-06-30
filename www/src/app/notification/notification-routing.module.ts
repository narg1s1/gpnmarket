import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotificationsComponent } from "./components/notifications/notifications.component";

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    data: {
      title: "Уведомления"
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class NotificationRoutingModule {
}
