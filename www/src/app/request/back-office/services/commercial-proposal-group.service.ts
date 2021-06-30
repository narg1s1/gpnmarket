import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestOfferPosition } from "../../common/models/request-offer-position";
import { Observable, of } from "rxjs";
import { RequestDocument } from "../../common/models/request-document";
import { RequestPosition } from "../../common/models/request-position";
import { ContragentList } from 'src/app/contragent/models/contragent-list';
import { PositionsWithSuppliers } from "../models/positions-with-suppliers";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { ProposalGroup } from "../../common/models/proposal-group";
import { ProposalGroupFilter } from "../../common/models/proposal-group-filter";
import { FormDataService } from "../../../shared/services/form-data.service";
import { CommonProposal, CommonProposalPayload } from "../../common/models/common-proposal";

@Injectable()
export class CommercialProposalGroupService {

  constructor(private api: HttpClient) {}

  info(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/commercial-proposal-groups/${ groupId }/view`;
    return this.api.get<ProposalGroup>(url);
  }

  list(requestId: Uuid, filters: ProposalGroupFilter = {}) {
    const url = `requests/backoffice/${ requestId }/commercial-proposal-groups`;
    return this.api.post<ProposalGroup[]>(url, { filters });
  }

  create(requestId: Uuid, body: Partial<ProposalGroup<Uuid>>) {
    const url = `requests/backoffice/${ requestId }/commercial-proposal-groups/create`;
    return this.api.post<ProposalGroup>(url, body);
  }

  update(requestId: Uuid, groupId: Uuid, body: Partial<ProposalGroup<Uuid>>) {
    const url = `requests/backoffice/${ requestId }/commercial-proposal-groups/${ groupId }/edit`;
    return this.api.post<ProposalGroup>(url, body);
  }
}
