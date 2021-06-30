import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AgreementsResponse } from "../../common/models/agreements-response";
import { Observable, of } from "rxjs";
import { Uuid } from "../../../cart/models/uuid";

@Injectable()
export class AgreementsService {

  constructor(private api: HttpClient) {
  }

  getAgreements(filters = null, startFrom: number = 0, pageSize: number = 20): Observable<AgreementsResponse> {
    const url = `requests/customer/tasks`;
    return this.api.post<AgreementsResponse>(url, {startFrom, pageSize, filters});
  }

  setRating = (requestId: Uuid, positionId: Uuid, rating: number) => {
    const url = `requests/customer/${requestId}/positions/${positionId}/set-rating`;
    return this.api.post<any>(url, {rating});
  }
}
