import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebsocketService } from './services/websocket.service';
import { WsChatService } from "./services/ws-chat.service";
import { WsConfig } from "./models/ws-config";
import { config } from "./services/ws-config-token";
import { WsNotificationsService } from "./services/ws-notifications.service";

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        WebsocketService,
        WsChatService,
        WsNotificationsService
    ]
})
export class WebsocketModule {
    public static config(wsConfig: WsConfig): ModuleWithProviders<WebsocketModule> {
        return {
            ngModule: WebsocketModule,
            providers: [{ provide: config, useValue: wsConfig }]
        };
    }
}
