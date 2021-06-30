import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ChatNotificationComponent } from "./components/chat-notification/chat-notification.component";


@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ChatNotificationComponent,
  ],
  exports: [
    ChatNotificationComponent,
  ],
})
export class ChatSharedModule { }
