import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ReactiveFormsModule } from "@angular/forms";
import { ChatViewComponent } from './components/chat-view/chat-view.component';
import { ChatRoutingModule } from "./chat-routing.module";
import { ChatContextViewComponent } from "./components/chat-context-view/chat-context-view.component";
import { NgxsModule } from "@ngxs/store";
import { ChatItemsState } from "./states/chat-items.state";
import { ChatMessagesState } from "./states/chat-messages.state";
import { ChatFormComponent } from './components/chat-form/chat-form.component';
import { ChatSubItemsState } from "./states/chat-sub-items.state";
import { ChatSubItemsFilterPipe } from "./pipes/chat-sub-items-filter-pipe";
import { ChatSharedModule } from "./chat-shared.module";


@NgModule({
  declarations: [
    ChatViewComponent,
    ChatContextViewComponent,
    ChatFormComponent,
    ChatSubItemsFilterPipe
  ],
  imports: [
    ReactiveFormsModule,
    ChatRoutingModule,
    SharedModule,
    ChatSharedModule,
    NgxsModule.forFeature([
      ChatItemsState,
      ChatSubItemsState,
      ChatMessagesState
    ]),
  ]
})
export class ChatModule { }
