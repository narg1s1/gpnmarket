import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { Contract } from "../../request/common/models/contract";

@Injectable({
  providedIn: "root"
})
export class ContractSignService {

  destroy$ = new Subject();

  constructor(private api: HttpClient) {}

  getContractSignInfo(contractId): Observable<Contract> {
    const url = `requests/supplier/contracts/${contractId}/view`;
    return this.api.post<Contract>(url, {});
  }

  signDocument(contractId, data) {
    const url = `requests/supplier/contracts/${contractId}/sign-with-signature`;
    return this.api.post(url, data);
  }
}
