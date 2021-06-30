import { Route, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ChatViewComponent } from "./components/chat-view/chat-view.component";
import { ChatContextViewComponent } from "./components/chat-context-view/chat-context-view.component";
import { CanActivateFeatureGuard } from "../core/can-activate-feature.guard";

const getChatData = (data: Route['data'] = {}) => ({
  ...data,
  hideTitle: true,
  hideBreadcrumbs: true,
  noContentPadding: true,
  noFooter: true
});

const routes: Routes = [
  {
    path: '',
    component: ChatViewComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "chat" },
    children: [
      {
        path: ':requestId',
        component: ChatContextViewComponent,
        data: getChatData({ title: 'Сообщения' })
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ChatRoutingModule {
}
