import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Uuid} from "../../../cart/models/uuid";
import {TechnicalProposalPosition} from "../../common/models/technical-proposal-position";
import { TechnicalProposal } from "../../common/models/technical-proposal";
import { Observable } from "rxjs";
import { TechnicalProposalFilter } from "../../common/models/technical-proposal-filter";
import { TechnicalProposalsStatus } from "../../common/enum/technical-proposals-status";
import { ContragentInfo } from "../../../contragent/models/contragent-info";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class TechnicalProposalsService {

  constructor(private api: HttpClient) {}

  list(requestId: Uuid, filters: TechnicalProposalFilter<Uuid>): Observable<TechnicalProposal[]> {
    const url = `requests/customer/${requestId}/technical-proposals`;
    return this.api.post<TechnicalProposal[]>(url, { filters });
  }

  availableFilters(requestId: Uuid): Observable<TechnicalProposalFilter> {
    const url = `requests/customer/${requestId}/technical-proposals/available-filters`;
    return this.api.get<{ statuses: TechnicalProposalsStatus[], suppliers: ContragentInfo[] }>(url).pipe(
      map(({ statuses: tpStatus, suppliers: contragents }) => ({ contragents, tpStatus }))
    );
  }

  accept(requestId: Uuid, technicalProposalId: Uuid, technicalProposalsPositions: TechnicalProposalPosition[]) {
    const url = `requests/customer/${requestId}/technical-proposals/${technicalProposalId}/accept`;
    return this.api.post(url, { positions: technicalProposalsPositions.map(({id}) => id) });
  }

  reject(requestId: Uuid, technicalProposalId: Uuid, technicalProposalsPositions: TechnicalProposalPosition[], comment) {
    const url = `requests/customer/${requestId}/technical-proposals/${technicalProposalId}/decline`;
    return this.api.post(url, { positions: technicalProposalsPositions.map(({id}) => id), comment });
  }

  sendToEdit(requestId: Uuid, technicalProposalId: Uuid, technicalProposalsPositions: TechnicalProposalPosition[], comment) {
    const url = `requests/customer/${requestId}/technical-proposals/${technicalProposalId}/send-to-edit-positions`;
    return this.api.post(url, { positions: technicalProposalsPositions.map(({id}) => id), comment });
  }
}
