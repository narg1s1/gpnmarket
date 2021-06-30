import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Uuid } from "../../cart/models/uuid";
import { UsersGroup } from "../models/users-group";

@Injectable()
export class UsersGroupService {

  loading = false;

  constructor(
    protected api: HttpClient
  ) {
  }

  getBackofficeGroups(): Observable<UsersGroup[]> {
    return this.api.get<UsersGroup[]>(`users/groups/backoffice`);
  }
}
