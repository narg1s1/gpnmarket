import { shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { TechnicalCommercialProposalPosition } from "../../common/models/technical-commercial-proposal-position";
import { ProposalGroup } from "../../common/models/proposal-group";
import { CommonProposalPayload } from "../../common/models/common-proposal";
import { ProposalGroupFilter } from "../../common/models/proposal-group-filter";

@Injectable()
export class TechnicalCommercialProposalService {

  constructor(protected api: HttpClient) {}

  list(requestId: Uuid, groupId: Uuid) {
    const url = `requests/customer/${requestId}/offers-approve-groups`;
    return this.api.post<CommonProposalPayload>(url, { requestTechnicalCommercialProposalGroupId: groupId });
  }

  review(data: { accepted: Uuid[], sendToEdit: Uuid[] }, offersApproveGroupId, comment: string) {
    const url = `requests/customer/technical-commercial-proposal-positions/change-statuses`;
    return this.api.post<CommonProposalPayload>(url, {offersApproveGroupId, ...data, comment } );
  }

  group(requestId: Uuid, offersApproveGroupId: Uuid) {
    const url = `requests/customer/${ requestId }/offers-approve-groups/proposals`;
    return this.api.post<CommonProposalPayload>(url, { offersApproveGroupId }).pipe(shareReplay());
  }

  groupList(requestId: Uuid, filters: ProposalGroupFilter = {}) {
    const url = `requests/customer/${ requestId }/offers-approve-groups`;
    return this.api.post<ProposalGroup[]>(url, { filters });
  }

  // Кнопка для заказчика
  downloadAnalyticalReport(requestId: Uuid, offersApproveGroupId: Uuid) {
    const url = `requests/customer/${ requestId }/analytic-report/offers-approve-group/${offersApproveGroupId}/download-by-tcp`;
    return this.api.post(url, { requestTechnicalCommercialProposalGroupId: offersApproveGroupId }, { responseType: 'blob' });
  }
}
