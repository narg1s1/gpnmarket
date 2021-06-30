import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestOfferPosition } from "../../common/models/request-offer-position";
import { Observable } from "rxjs";
import { RequestDocument } from "../../common/models/request-document";
import { RequestPosition } from "../../common/models/request-position";
import { ContragentList } from 'src/app/contragent/models/contragent-list';
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { ProposalGroup } from "../../common/models/proposal-group";
import { FormDataService } from "../../../shared/services/form-data.service";
import { CommonProposal, CommonProposalPayload } from "../../common/models/common-proposal";
import { TechnicalCommercialProposal } from "../../common/models/technical-commercial-proposal";

@Injectable({
  providedIn: "root"
})
export class CommercialProposalsDeprecatedService {

  constructor(private api: HttpClient, private formDataService: FormDataService) {
  }

  /**
   * @deprecated
   */
  uploadDocuments(offer: RequestOfferPosition, files: File[]): Observable<RequestDocument[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file, file.name);
    });

    const url = `requests/backoffice/offers/${ offer.id }/documents/upload`;
    return this.api.post<RequestDocument[]>(url, formData);
  }

  /**
   * @deprecated
   */
  uploadTechnicalProposals(offer: RequestOfferPosition, files: File[]): Observable<RequestDocument[]> {
    const url = `requests/backoffice/offers/${ offer.id }/technical-proposals/upload`;
    return this.api.post<RequestDocument[]>(url, this.formDataService.toFormData({ files }));
  }
}
