import { Injectable } from '@angular/core';
import { WsChatService } from "../../websocket/services/ws-chat.service";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private ws: WsChatService) {}

  get(userId: number, limit: number = 50, offset: number = 0) {
    this.ws.send(`users.get`, { userId, limit, offset });
  }

  getSelf() {
    this.ws.send(`users.getself`);
  }
}
