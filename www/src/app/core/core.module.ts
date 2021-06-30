import { DownloadDocumentComponent } from './components/download-document/download-document.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { NavComponent } from './components/nav/nav.component';
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { throwIfAlreadyLoaded } from "./module-import-guard";
import { DataInterceptor } from "./interceptor/data.interceptor";
import { ErrorInterceptor } from "./interceptor/error.interceptor";
import { BaseUrlInterceptor } from "./interceptor/base-url-interceptor";
import { UxgModule } from "uxg";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { WelcomeComponent } from "../pages/welcome/welcome.component";
import { ChatSharedModule } from "../chat/chat-shared.module";
import { NotificationPopupComponent } from "./components/notification-popup-list/notification-popup.component";
import { NotificationListComponent } from "./components/notification-list/notification-list.component";
import { NotificationCardComponent } from "./components/notification-card/notification-card.component";
import { NgxsModule } from "@ngxs/store";
import { UsersGroupService } from "./services/users-group.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UxgModule,
    ChatSharedModule,
    NgxsModule.forRoot()
  ],
  exports: [NavComponent,
            WelcomeComponent,
            NotificationListComponent,
            NotificationPopupComponent,
            NotificationCardComponent],
  declarations: [NavComponent,
                WelcomeComponent,
                NotificationListComponent,
                NotificationPopupComponent,
                NotificationCardComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: DataInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    UsersGroupService
  ],
})

export class CoreModule {
  // модуль Core должен быть загружен только один раз из модуля App
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
