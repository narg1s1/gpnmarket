import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { TechnicalProposal } from "../../common/models/technical-proposal";
import { Observable } from "rxjs";
import { RequestPosition } from "../../common/models/request-position";
import { TechnicalProposalCreateRequest } from "../models/technical-proposal-create-request";
import { TechnicalProposalsStatus } from "../../common/enum/technical-proposals-status";
import { TechnicalProposalFilter } from "../../common/models/technical-proposal-filter";
import { FormDataService } from "../../../shared/services/form-data.service";
import { TechnicalProposalWithPositions } from "../models/technical-proposal-with-positions";
import { map } from "rxjs/operators";
import { ContragentInfo } from "../../../contragent/models/contragent-info";

@Injectable()
export class TechnicalProposalsService {

  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  list(requestId: Uuid, filters: TechnicalProposalFilter<Uuid>) {
    const url = `requests/backoffice/${requestId}/technical-proposals`;
    return this.api.post<TechnicalProposal[]>(url, { filters });
  }

  availableFilters(requestId: Uuid): Observable<TechnicalProposalFilter> {
    const url = `requests/backoffice/${requestId}/technical-proposals/available-filters`;
    return this.api.get<{ statuses: TechnicalProposalsStatus[], suppliers: ContragentInfo[] }>(url).pipe(
      map(({ statuses: tpStatus, suppliers: contragents }) => ({ contragents, tpStatus }))
    );
  }

  positions(id: Uuid) {
    const url = `requests/backoffice/${id}/technical-proposals/positions`;
    return this.api.get<RequestPosition[]>(url);
  }

  create(requestId: Uuid, technicalProposal: TechnicalProposalCreateRequest) {
    const url = `requests/backoffice/${requestId}/technical-proposals/create`;
    return this.api.post<TechnicalProposal>(url, technicalProposal);
  }

  edit(requestId: Uuid, technicalProposal: TechnicalProposalCreateRequest) {
    const url = `requests/backoffice/${requestId}/technical-proposals/edit`;
    return this.api.post<TechnicalProposal>(url, technicalProposal);
  }


  setManufacturingName(requestId: Uuid, tpId: Uuid, technicalProposal) {
    const url = `requests/backoffice/${requestId}/technical-proposals/${tpId}/update-manufacturing-name`;
    return this.api.post(url, technicalProposal);
  }

  sendForApproval(requestId: Uuid, technicalProposal: TechnicalProposal) {
    const url = `requests/backoffice/${requestId}/technical-proposals/${technicalProposal.id}/send-to-agreement`;
    return this.api.post(url, technicalProposal);
  }

  rollback(requestId: Uuid, technicalProposal: TechnicalProposal): Observable<TechnicalProposal> {
    const url = `requests/backoffice/${requestId}/technical-proposals/${technicalProposal.id}/cancel-send-to-agreement`;
    return this.api.post<TechnicalProposal>(url, technicalProposal);
  }

  uploadDocuments(requestId: Uuid, tpId: Uuid, documents: File[]) {
    const url = `requests/backoffice/${requestId}/technical-proposals/${tpId}/upload-documents`;
    return this.api.post(url, this.formDataService.toFormData({ files: { documents } }));
  }

  uploadTemplate(requestId: Uuid, files: File[]) {
    const url = `requests/backoffice/${requestId}/technical-proposals/upload-excel`;

    return this.api.post<TechnicalProposalWithPositions>(url, this.formDataService.toFormData({ files }));
  }

  downloadTemplate(requestId: Uuid, contragentId: Uuid) {
    const url = `requests/backoffice/${requestId}/technical-proposals/download-excel-template`;
    return this.api.post(url, { supplierContragentId: contragentId }, { responseType: 'blob' });
  }
}
