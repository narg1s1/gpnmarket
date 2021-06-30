import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { RequestPosition } from "../../common/models/request-position";

@Injectable({
  providedIn: "root"
})
export class PositionService {

  constructor(protected api: HttpClient) {}

  get(id: Uuid) {
    return of<RequestPosition>(null);
  }
}
