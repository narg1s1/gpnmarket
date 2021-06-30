import { Inject, Injectable } from '@angular/core';
import {
  bufferToggle,
  delayWhen,
  filter,
  flatMap,
  map,
  shareReplay,
  take,
  tap,
  windowToggle
} from "rxjs/operators";
import { IWebsocketService } from "../websocket.interfaces";
import { WebSocketSubject } from "rxjs/webSocket";
import { WsChatTypes } from "../enum/ws-chat-types";
import { WsChatMessage } from "../models/ws-chat-message";
import { WsConfig } from "../models/ws-config";
import { config } from "./ws-config-token";
import { BehaviorSubject, merge, ReplaySubject, Subject, timer } from "rxjs";
import { KeycloakService } from "keycloak-angular";
import { User } from "../../user/models/user";
import { UserInfoService } from "../../user/service/user-info.service";
import { FeatureService } from "../../core/services/feature.service";
import { AuthService } from "../../auth/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class WsChatService implements IWebsocketService {
  websocket$: WebSocketSubject<WsChatMessage<unknown>>;
  readonly authorized$ = new BehaviorSubject<boolean>(false);
  readonly send$ = new ReplaySubject<WsChatMessage<unknown>>();
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
        if (this.featureService.authorize('chat')) {
          this.connect(accessToken);
        }
      });

      // Если приходит rejected, считаем что нужна авторизация, пробуем авторизоваться (макс 5 попыток с интервалом 3 сек)
      this.on(WsChatTypes.REJECTED).pipe(
        delayWhen<any>((v, i) => timer(i > 0 ? this.wsConfig.reconnectInterval ?? 3000 : 0)),
        take(this.wsConfig.reconnectAttempts ?? 5),
        tap(() => this.authorized$.next(false))
      ).subscribe(() => this.send<User>(`authorize`, { accessToken }));

      // Если приходит granted, считаем что авторизованы
      this.on(WsChatTypes.GRANTED).subscribe(() => this.authorized$.next(true));

      // Все эмиты разлогина (rejected)
      const off$ = this.authorized$.pipe(filter(v => !v));
      // Все эмиты успешной авторизации (granted)
      const on$ = this.authorized$.pipe(filter(v => v));

      // Пока мы разлогинены все запросы которые мы шлём на сокеты остаются в буффере
      // Как только произойдет логин, выгружаем всё из буфера и отправляем на сервер
      merge(
        this.send$.pipe(bufferToggle(off$, () => on$)),
        this.send$.pipe(windowToggle(on$, () => off$))
      ).pipe(flatMap(x => x)).subscribe(data => this.websocket$.next(data));

      this.send$.pipe(filter(({ type }) => type === `authorize`)).subscribe(data => this.websocket$.next(data));
    });
  }

  on<T>(event: WsChatTypes) {
    return this.received$.pipe(
      filter(({ type }) => event && type === event),
      map(({ data }: WsChatMessage<T>) => data)
    );
  }

  send<T = any, D = any>(type: WsChatTypes | string, data?: D) {
    // Не шлём запросы напрямую в websocket$.next() для буффера запросов (см. выше) которые отправились ДО овторизации
    this.send$.next({ type: <WsChatTypes>type, data: data ?? {} });

    return this.on<T>(<WsChatTypes>type);
  }

  private connect(token) {
    this.websocket$ = new WebSocketSubject<WsChatMessage<unknown>>({
      url: this.wsConfig.chatUrl + '?authorization=' + token,
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
