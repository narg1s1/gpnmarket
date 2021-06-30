import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { FormDataService } from "../../../shared/services/form-data.service";
import { ProposalGroup } from "../../common/models/proposal-group";
import { CommonProposal, CommonProposalItem, CommonProposalPayload } from "../../common/models/common-proposal";
import { ContragentList } from 'src/app/contragent/models/contragent-list';

@Injectable()
export class CommercialProposalsService {

  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  list(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/commercial-proposals`;
    return this.api.post<CommonProposalPayload>(url, { groupId });
  }

  create(requestId: Uuid, groupId: Uuid, data: Partial<CommonProposal>) {
    const url = `requests/backoffice/${ requestId }/offers/create`;
    return this.api.post<CommonProposal>(url, this.formDataService.toFormData({ groupId, ...data }));
  }

  update(data: Partial<CommonProposal> & { id: Uuid }) {
    const url = `requests/backoffice/offers/${ data.id }/edit`;
    return this.api.post<CommonProposal>(url, this.formDataService.toFormData(data));
  }

  editItems(proposalId: Uuid, items: Partial<CommonProposalItem>[]) {
    const url = `requests/backoffice/offers/${ proposalId }/edit-offers`;
    return this.api.post<CommonProposalItem[]>(url, this.formDataService.toFormData({ items }));
  }

  availablePositions(requestId: Uuid, groupId?: Uuid, name?: string) {
    const url = `requests/backoffice/${ requestId }/commercial-proposals/available-request-positions`;
    return this.api.post<RequestPosition[]>(url, { requestCommercialProposalGroupId: groupId, name, pageSize: 100 });
  }

  publish(groupId: Uuid, positionIds: Uuid[]) {
    const url = `requests/backoffice/offers/publish-offers`;

    return this.api.post<CommonProposalPayload>(url, { groupId, positionIds });
  }

  downloadTemplate(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/download-offers-template`;
    return this.api.post(url, { groupId }, { responseType: 'blob' });
  }

  uploadTemplate(requestId: Uuid, groupId: Uuid, files: File[]) {
    const url = `requests/backoffice/${ requestId }/add-offers-from-excel`;
    const data = { files, groupId };

    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData(data));
  }

  uploadTemplateFromGroups(requestId: Uuid, files: File[], requestCommercialProposalGroupName: string) {
    const url = `requests/backoffice/${ requestId }/commercial-proposal-groups/upload-excel`;
    const data = { files, requestCommercialProposalGroupName };

    return this.api.post<ProposalGroup>(url, this.formDataService.toFormData(data));
  }

  downloadAnalyticalReport(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/analytic-report/download-by-cp`;
    return this.api.post(url, { groupId }, { responseType: 'blob' });
  }

  rollback(requestId: Uuid, groupId: Uuid, positionId: Uuid) {
    const url = `requests/backoffice/${ requestId }/cancel-publish-offers`;
    return this.api.post<CommonProposalPayload>(url, { groupId, positionId });
  }

  getContragentsWithTp(requestId: Uuid, positions: Uuid[]) {
    const url = `requests/backoffice/${ requestId }/contragents-with-tp`;
    return this.api.post<ContragentList[]>(url, { positions });
  }
}
