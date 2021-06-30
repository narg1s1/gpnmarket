import { Injectable } from '@angular/core';
import { WsChatService } from "../../websocket/services/ws-chat.service";
import { ChatContext } from "../models/chat-context";
import { Uuid } from "../../cart/models/uuid";
import { Observable } from "rxjs";
import { RequestPositionList } from "../../request/common/models/request-position-list";
import { map } from "rxjs/operators";
import { RequestGroup } from "../../request/common/models/request-group";
import { RequestPosition } from "../../request/common/models/request-position";
import { HttpClient } from "@angular/common/http";
import { Page } from "../../core/models/page";
import { RequestListItem } from "../../request/common/models/requests-list/requests-list-item";

@Injectable({
  providedIn: 'root'
})
export class ContextsService {

  constructor(private ws: WsChatService, protected api: HttpClient) {}

  get(payload?: {contextId?: number, offset?: number, limit?: number}) {
    return this.ws.send<ChatContext[]>(`contexts.get`, payload);
  }

  create(serviceID: string, status: string, name: string, supervisorUid: string, items: [] ) {
    this.ws.send(`contexts.create`, { serviceID, status, name, supervisorUid, items });
  }

  setStatus(contextId: number, newStatus: string) {
    this.ws.send(`contexts.setStatus`, { contextId, newStatus });
  }

  setSupervisor(contextId: number, userId: number) {
    this.ws.send(`contexts.setSupervisor`, {contextId, userId});
  }

  merge(contexts: number[], newStatus: string, newName: string, newSupervisorUid: string) {
    this.ws.send(`contexts.merge`, { contexts, newStatus, newName, newSupervisorUid });
  }

  addItems(contextId: number, items: { id: number, data: string }[]) {
    this.ws.send(`contexts.addItems`, { contextId, items });
  }

  removeItems(contextId: number, items: number[]) {
    this.ws.send(`contexts.removeItems`, { contextId, items });
  }

  getRequests(role, startFrom, pageSize, filters?, sort?) {
    return this.api.post<Page<RequestListItem>>(`chat/${role}/requests`, { startFrom, pageSize, filters, sort });
  }

  getRequestItems(id: Uuid, role): Observable<RequestPositionList[]> {
    const url = `chat/${role}/requests/${id}/positions`;
    return this.api.post<RequestPositionList[]>(url, {}).pipe(
      map((data: RequestPositionList[]) => {
        return data.map(function recursiveMapPositionList(item: RequestPositionList) {
          switch (item.entityType) {
            case 'GROUP':
              const group = new RequestGroup(item);
              group.positions = group.positions.map(recursiveMapPositionList);

              return group;
            case 'POSITION':
              return new RequestPosition(item);
          }
        });
      })
    );
  }
}
