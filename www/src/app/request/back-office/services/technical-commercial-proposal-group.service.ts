import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { FormDataService } from "../../../shared/services/form-data.service";
import { ProposalGroup } from "../../common/models/proposal-group";
import { TechnicalCommercialProposalGroupFilter } from "../../common/models/technical-commercial-proposal-group-filter";

@Injectable()
export class TechnicalCommercialProposalGroupService {

  constructor(protected api: HttpClient, private formDataService: FormDataService) {}

  info(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposal-groups/${ groupId }/view`;
    return this.api.get<ProposalGroup>(url);
  }

  list(requestId: Uuid, filters: TechnicalCommercialProposalGroupFilter = {}) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposal-groups`;
    return this.api.post<ProposalGroup[]>(url, { filters });
  }

  create(requestId: Uuid, body: Partial<ProposalGroup<Uuid>>) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposal-groups/create`;
    return this.api.post<ProposalGroup>(url, body);
  }

  update(requestId: Uuid, groupId: Uuid, body: Partial<ProposalGroup<Uuid>>) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposal-groups/${ groupId }/edit`;
    return this.api.post<ProposalGroup>(url, body);
  }
}
