import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AgreementsResponse } from "../../common/models/agreements-response";
import { Observable } from "rxjs";
import { Agreement } from "../../common/models/Agreement";

@Injectable()
export class AgreementsService {

  constructor(private api: HttpClient) {}

  getAgreements(filters, startFrom: number = 0, pageSize: number = 20): Observable<AgreementsResponse> {
    const url = `requests/backoffice/tasks`;
    return this.api.post<AgreementsResponse>(url, {startFrom, pageSize, filters});
  }
}
