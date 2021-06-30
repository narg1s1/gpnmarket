import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { ProposalGroup } from "../../common/models/proposal-group";
import { ProposalGroupFilter } from "../../common/models/proposal-group-filter";
import { CommonProposalPayload } from "../../common/models/common-proposal";

@Injectable()
export class CommercialProposalsService {

  constructor(private api: HttpClient) {}

  list(requestId: Uuid, groupId: Uuid) {
    const url = `requests/customer/${requestId}/positions-with-offers`;
    return this.api.post<CommonProposalPayload>(url, { groupId });
  }

  review(requestId: Uuid, data: { accepted: Uuid[], sendToEdit: Uuid[] }) {
    const url = `requests/customer/${requestId}/commercial-proposals/change-statuses`;
    return this.api.post<CommonProposalPayload>(url, data);
  }

  group(requestId: Uuid, groupId: Uuid) {
    const url = `requests/customer/${ requestId }/commercial-proposal-groups/${ groupId }/view`;
    return this.api.get<ProposalGroup>(url);
  }

  groupList(requestId: Uuid, filters: ProposalGroupFilter = {}) {
    const url = `requests/customer/${ requestId }/commercial-proposal-groups`;
    return this.api.post<ProposalGroup[]>(url, { filters });
  }

  downloadAnalyticalReport(requestId: Uuid, groupId: Uuid) {
    const url = `requests/customer/${ requestId }/analytic-report/download-by-cp`;
    return this.api.post(url, { requestCommercialProposalGroupId: groupId }, { responseType: 'blob' });
  }
}
