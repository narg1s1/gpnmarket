import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { environment } from './../environments/environment';
import localeRu from '@angular/common/locales/ru';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { DoBootstrap, ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { NgxsModule } from "@ngxs/store";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { registerLocaleData } from '@angular/common';
import { UxgModule } from "uxg";
import { APP_CONFIG } from "./core/config/gpnmarket-config.interface";
import { AppComponent } from './app.component';
import { AppConfig } from './config/app.config';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from "./core/core.module";
import { ToastListModule } from "./shared/components/toast-list/toast-list.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { SentryErrorHandler } from "./core/error-handlers/sentry.error-handler";
import { KeycloakService, KeycloakAngularModule } from "keycloak-angular";
import { AuthService } from "./auth/services/auth.service";
import { ApplicationRef } from "@angular/core";
import { CartStoreService } from "./cart/services/cart-store.service";
import { ElementBearerService, NormalizationService } from "isource-element";

registerLocaleData(localeRu, 'ru');

const keycloakService = new KeycloakService();

@NgModule({
  declarations: [ AppComponent ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    NgxsModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    ToastListModule,
    UxgModule,
    WebsocketModule.config({ url: AppConfig.endpoints.ws, chatUrl: AppConfig.endpoints.wsChat, notificationsUrl: AppConfig.endpoints.wsNotifications }),
    BrowserModule,
    KeycloakAngularModule
  ],
  providers: [
    { provide: APP_CONFIG, useValue: AppConfig },
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    { provide: KeycloakService, useValue: keycloakService },
    ElementBearerService,
    NormalizationService
  ],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap {
  constructor(
    public authService: AuthService,
    public cartStoreService: CartStoreService,
  ) {
  }

  ngDoBootstrap(app: ApplicationRef) {
    keycloakService
      .init(AppConfig.keycloak)
      .then(() => {
        app.bootstrap(AppComponent);
      })
      .catch(error => console.error('[ngDoBootstrap] init Keycloak failed', error));

    keycloakService
      .getKeycloakInstance()
      .onAuthSuccess = () => {
        this.authService.saveAuthUserData().subscribe();
        this.cartStoreService.load();
      };

    keycloakService
      .getKeycloakInstance()
      .onAuthRefreshSuccess = () => {
        this.authService.saveAuthUserData().subscribe();
        this.cartStoreService.load();
      };
  }
}
