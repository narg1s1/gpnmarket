import { Inject, Injectable, OnInit } from '@angular/core';
import {
  bufferToggle,
  delayWhen,
  filter,
  flatMap,
  map,
  shareReplay, skipWhile, switchMap,
  take,
  tap,
  windowToggle
} from "rxjs/operators";
import { IWebsocketService } from "../websocket.interfaces";
import { WebSocketSubject } from "rxjs/webSocket";
import { WsConfig } from "../models/ws-config";
import { config } from "./ws-config-token";
import { BehaviorSubject, from, merge, ReplaySubject, Subject, timer } from "rxjs";
import { KeycloakService } from "keycloak-angular";
import { User } from "../../user/models/user";
import { WsNotification } from "../models/ws-notification";
import { WsNotificationTypes } from "../enum/ws-notification-types";
import { UserInfoService } from "../../user/service/user-info.service";
import { FeatureService } from "../../core/services/feature.service";
import { AuthService } from "../../auth/services/auth.service";

@Injectable({
   providedIn: 'root'
})
export class WsNotificationsService implements IWebsocketService {
  websocket$: WebSocketSubject<WsNotification<unknown>>;
  readonly authorized$ = new BehaviorSubject<boolean>(false);
  readonly send$ = new ReplaySubject<WsNotification<unknown>>();
  readonly received$ = new Subject<unknown>();

  constructor(
    @Inject(config) private wsConfig: WsConfig,
    private keycloakService: KeycloakService,
    private user: UserInfoService,
    public authService: AuthService,
    public featureService: FeatureService,
  ) {
    this.keycloakService.getToken(false).then(accessToken => {
      if (!accessToken) { return; }

      this.authService.onLogin.subscribe(() => {
        if (this.featureService.authorize('notifications')) {
          this.connect(accessToken);
        }
      });

        // Если приходит rejected, считаем что нужна авторизация, пробуем авторизоваться (макс 5 попыток с интервалом 3 сек)
        this.on(WsNotificationTypes.REJECTED).pipe(
          delayWhen<any>((v, i) => timer(i > 0 ? this.wsConfig.reconnectInterval ?? 3000 : 0)),
          take(this.wsConfig.reconnectAttempts ?? 5),
          tap(() => this.authorized$.next(false))
        ).subscribe(() => this.send<User>(`authorize`, { accessToken }));

        // Если приходит granted, считаем что авторизованы
        this.on(WsNotificationTypes.AUTHORIZED).subscribe(() => this.authorized$.next(true));

        // Все эмиты успешной авторизации (granted)
        const on$ = this.authorized$.pipe(filter(v => v));

        // Все эмиты разлогина (rejected)
        const off$ = this.authorized$.pipe(filter(v => !v));

        // Пока мы разлогинены все запросы которые мы шлём на сокеты остаются в буффере
        // Как только произойдет логин, выгружаем всё из буфера и отправляем на сервер
        merge(
          this.send$.pipe(bufferToggle(off$, () => on$)),
          this.send$.pipe(windowToggle(on$, () => off$))
        ).pipe(flatMap(x => x)).subscribe(data => this.websocket$.next(data));

        this.send$.pipe(filter(({ type }) => type === `authorize`)).subscribe(data => this.websocket$.next(data));
      });
  }

  on<T>(event: WsNotificationTypes) {
    return this.received$.pipe(
      filter(({ type }) => event && type === event),
      map(({ data }: WsNotification<T>) => data)
    );
  }

  send<T = any, D = any>(type: WsNotificationTypes | string, data?: D) {
    // Не шлём запросы напрямую в websocket$.next() для буффера запросов (см. выше) которые отправились ДО овторизации
    this.send$.next({ type: <WsNotificationTypes>type, data: data ?? {} });

    return this.on<T>(<WsNotificationTypes>type);
  }

  private connect(token) {
    this.websocket$ = new WebSocketSubject<WsNotification<unknown>>({
      url: this.wsConfig.notificationsUrl + '?auth=' + token,
      closeObserver: {
        next: () => {
          this.authorized$.next(false);
          timer(this.wsConfig.reconnectInterval ?? 3000).subscribe(() => this.connect(token));
        }
      },
    });

    this.websocket$.pipe(shareReplay(1)).subscribe(data => this.received$.next(data));
  }
}
