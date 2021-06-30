import { Inject, Injectable, OnDestroy } from '@angular/core';
import { interval, Observable, Observer, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { IWebsocketService } from '../websocket.interfaces';
import { KeycloakService } from "keycloak-angular";
import { WsTypes } from "../enum/ws-types";
import { WsMessage } from "../models/ws-message";
import { WsConfig } from "../models/ws-config";
import { config } from "./ws-config-token";


@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements IWebsocketService, OnDestroy {

  private readonly config: WebSocketSubjectConfig<WsMessage<any>> = {
    url: null,
    closeObserver: {
      next: () => {
        this.websocket$ = null;
        this.connection$.next(false);
      }
    },
    openObserver: {
      next: () => this.connection$.next(true)
    }
  };

  private reconnection$: Observable<number>;
  private connection$: Observer<boolean>;
  private wsMessages$ = new Subject<WsMessage<any>>();
  private destroy$ = new Subject();

  // number of connection attempts
  private readonly reconnectAttempts = this.wsConfig.reconnectAttempts ?? 10;
  // pause between connections
  private reconnectInterval = this.wsConfig.reconnectInterval ?? 5000;
  private isConnected: boolean;
  public status = new Observable<boolean>(observer => this.connection$ = observer).pipe(share(), distinctUntilChanged());
  public websocket$: WebSocketSubject<WsMessage<unknown>>;

  constructor(
    @Inject(config) private wsConfig: WsConfig,
    private keycloakService: KeycloakService,
  ) {
    this.keycloakService.getToken().then(token => {
      // run reconnect if not connection
      this.status.pipe(takeUntil(this.destroy$)).subscribe(isConnected => {
        this.isConnected = isConnected;

        if (!this.reconnection$ && typeof (isConnected) === 'boolean' && !isConnected) {
          this.reconnect();
        }
      });

      this.wsMessages$.pipe(takeUntil(this.destroy$)).subscribe(
        () => {}, (error: ErrorEvent) => console.error('WebSocket error!', error)
      );
      this.config.url = wsConfig.url + '?access_token=' + token;
      this.connect();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /*
  * connect to WebSocket
  * */
  private connect() {
    this.websocket$ = new WebSocketSubject<WsMessage<unknown>>("");

    this.websocket$.subscribe(
      message => this.wsMessages$.next(message),
      () => {
        if (!this.websocket$) {
          // run reconnect if errors
          this.reconnect();
        }
      });
    return this.websocket$;
  }

  /*
  * reconnect if not connecting or errors
  * */
  private reconnect(): void {
    this.reconnection$ = interval(this.reconnectInterval)
      .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.websocket$));

    this.reconnection$.subscribe(
      () => this.connect(),
      () => {},
      () => {
        // Subject complete if reconnect attemts ending
        this.reconnection$ = null;

        if (!this.websocket$) {
          this.wsMessages$.complete();
          this.connection$.complete();
        }
      });
  }

  /*
  * on message event
  * */
  public on<T>(event: WsTypes): Observable<T> {
    return this.wsMessages$.pipe(
      filter(({ type }: WsMessage<T>) => event && type === event),
      map(({ data }: WsMessage<T>) => data)
    );
  }

  /*
  * on message to server
  * */
  public send(type: WsTypes, data: any = {}): void {
    if (type && this.isConnected) {
      this.websocket$.next({type: type, data: data});
    } else {
      console.error('Send error!');
    }
  }
}
