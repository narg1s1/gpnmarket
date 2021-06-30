import { Injectable } from '@angular/core';
import { Uuid } from "../../../cart/models/uuid";
import { Contract } from "../../common/models/contract";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestDocument } from "../../common/models/request-document";
import { FormDataService } from "../../../shared/services/form-data.service";
import { ContractFilter } from "../../common/models/contract-filter";

@Injectable()
export class ContractService {
  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  list(requestId: Uuid, filters?: ContractFilter<Uuid>): Observable<Contract[]> {
    const url = `requests/${requestId}/contracts`;
    return this.api.post<Contract[]>(url, { filters });
  }

  availableFilters(requestId: Uuid) {
    const url = `requests/customer/contracts/available-filters`;
    return this.api.post<ContractFilter>(url, { requestId });
  }

  reject(contractId: Uuid) {
    const url = `requests/customer/contracts/${contractId}/reject`;
    return this.api.get<Contract>(url);
  }

  approve(contractId: Uuid) {
    const url = `requests/customer/contracts/${contractId}/approve`;
    return this.api.get<Contract>(url);
  }

  confirmWithoutSigning(contractId: Uuid) {
    const url = `requests/customer/contracts/${contractId}/confirm-wo-sign`;
    return this.api.get<Contract>(url);
  }

  upload(contractId: Uuid, files: File[], comment?: string): Observable<RequestDocument[]> {
    const url = `requests/contracts/${contractId}/upload`;
    return this.api.post<RequestDocument[]>(url, this.formDataService.toFormData({ files, comments: [comment] }));
  }

  download(contractId: Uuid) {
    const url = `requests/contracts/${contractId}/generate`;
    return this.api.post(url, {}, { responseType: 'blob' });
  }

  signDocument(contractId, data) {
    const url = `requests/customer/contracts/${contractId}/sign-with-signature`;
    return this.api.post<Contract>(url, data);
  }
}
