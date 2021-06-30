import { Observable } from 'rxjs';
import { WebSocketSubject } from "rxjs/webSocket";

export interface IWebsocketService<T = string> {
    status?: Observable<boolean>;
    websocket$: WebSocketSubject<unknown>;
    on<D = any>(type: T): Observable<D>;
    send<D = any>(type: T, data: D): void;
}
