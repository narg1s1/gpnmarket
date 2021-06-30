import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ContragentList } from "../models/contragent-list";
import { ContragentInfo } from "../models/contragent-info";
import { Uuid } from "../../cart/models/uuid";
import { ContragentShortInfo } from "../models/contragent-short-info";
import { ContragentRegistrationRequest } from "../models/contragent-registration-request";

@Injectable({
  providedIn: "root"
})
export class ContragentService {

  constructor(
    protected api: HttpClient
  ) {
  }

  getContragentList(isGetByBackofficeGroups?): Observable<ContragentList[]> {
    return this.api.post<ContragentList[]>(`contragents`, {isGetByBackofficeGroups});
  }

  getCustomersList(): Observable<ContragentList[]> {
    return this.api.post<ContragentList[]>(`customers`, {});
  }

  getContragentInfo(id: Uuid): Observable<ContragentInfo> {
    return this.api.get<ContragentInfo>(`contragents/${id}/info`);
  }

  downloadPrimaInformReport(contragentId: Uuid) {
    return this.api.post(`contragents/${contragentId}/download-prima-inform-report`, {}, {responseType: 'blob'});
  }

  contragentExists(inn: string, kpp: string): Observable<ContragentShortInfo> {
    return this.api.post<ContragentShortInfo>('contragents/check-exists', { inn: inn, kpp: kpp });
  }

  registration(body: ContragentRegistrationRequest) {
    return this.api.post<ContragentShortInfo>("contragents/registration", body);
  }

  editContragent(contragentId: Uuid, body: ContragentRegistrationRequest) {
    return this.api.post<ContragentShortInfo>(`contragents/${contragentId}/edit`, body);
  }
}
