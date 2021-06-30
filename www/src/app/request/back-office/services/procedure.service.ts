import * as moment from 'moment';
import { IPositionsFilters } from './../../../positions/positions-filter';
import { IProposalsFilters, IAvailableProposalsFilters } from './../../../procedure/models/proposals-filters';
import { UserRole } from './../../../user/models/user-role';
import { ProceduresRequestsFilter } from './../models/procedures-filter';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestOfferPosition } from "../../common/models/request-offer-position";
import { Observable, of } from "rxjs";
import { ProcedureCreateResponse } from '../models/procedure-create-response';
import { Procedure } from "../models/procedure";
import { FormDataService } from "../../../shared/services/form-data.service";
import { ProposalSource } from "../enum/proposal-source";
import { IProcedureRequestFromSupplier } from './../../common/models/requests-list/request-from-supplier';
import {RequestPosition} from "../../common/models/request-position";
import { CommonProposal, CommonProposalItem, CommonProposalPayload } from "../../common/models/common-proposal";
import { OffersApproveGroupModel } from "../../../procedure/models/offers-approve-group.model";
import { ProposalGroup } from "../../common/models/proposal-group";

@Injectable()
export class ProcedureService {

  constructor(
    private api: HttpClient,
    private formDataService: FormDataService
  ) {}

  list(requestId: Uuid, source: ProposalSource, groupId?: Uuid): Observable<Procedure[]> {
    const url = `requests/backoffice/${requestId}/procedures`;
    const body = { source };
    body[source === ProposalSource.COMMERCIAL_PROPOSAL ? 'requestCommercialProposalGroupId' : 'requestTechnicalCommercialProposalGroupId'] = groupId;

    return this.api.post<Procedure[]>(url, body);
  }

  getProcedureInfo(procedureId): Observable<Procedure> {
    const url = `requests/backoffice/procedures/${procedureId}/info`;

    return this.api.post<Procedure>(url, {});
  }

  getCompositeProcedureData(groupId: Uuid, filters?: IProposalsFilters): Observable<{positions: RequestPosition[], proposals: CommonProposal[], offersApproveGroup: OffersApproveGroupModel, isCanApprove: boolean}> {
    const url = `requests/backoffice/positions/${groupId}/proposals`;

    return this.api.post<{positions: RequestPosition[], proposals: CommonProposal[], offersApproveGroup: OffersApproveGroupModel, isCanApprove: boolean}>(url, {filters});
  }

  create(requestId: Uuid, body: Procedure): Observable<ProcedureCreateResponse> {
    const url = `requests/backoffice/${requestId}/create-procedure`;
    return this.api.post<ProcedureCreateResponse>(url, this.formDataService.toFormData(body));
  }

  createFromPosition(body: Procedure, activeFilters: IPositionsFilters, useAllPositions: boolean): Observable<ProcedureCreateResponse> {
    const url = `requests/backoffice/positions/create-procedure-from-positions-list`;
    const payload = {
      ...body,
      filters: useAllPositions ? {} : {
        positions: body.positions
      }
    };
    if (activeFilters) {
      const keys = Object.keys(activeFilters)
        .filter(key => {
          if (activeFilters[key] !== null && activeFilters[key] !== '' && activeFilters[key] !== []) {
            return key;
          }
        });
      keys.forEach((key: string) => {
        payload.filters[key] = activeFilters[key];
      });
    }
    delete payload['requestProcedureId'];
    delete payload['source'];
    delete payload['positions'];
    return this.api.post<ProcedureCreateResponse>(url, this.formDataService.toFormData(payload));
  }

  createFromRequest(requestId: Uuid, body: Procedure): Observable<ProcedureCreateResponse> {
    const url = `requests/backoffice/${requestId}/create-procedure-from-request`;

    return this.api.post<ProcedureCreateResponse>(url, this.formDataService.toFormData(body));
  }

  bargain(procedureId: Uuid, body: Procedure): Observable<ProcedureCreateResponse> {
    const url = `requests/backoffice/procedures/${procedureId}/create-retrade`;

    return this.api.post<ProcedureCreateResponse>(url, body);
  }

  importOffersFromProcedure(procedureId: Uuid): Observable<RequestOfferPosition[]> {
    return this.api.get<RequestOfferPosition[]>(`requests/backoffice/procedures/${procedureId}/import-offers`);
  }

  getByPosition(positionId: Uuid) {
    const url = `/requests/backoffice/procedures-by-position`;
    return this.api.post<Procedure[]>(url, { positionId });
  }

  prolongateProcedureEndDate(proposalSource = null, requestId, procedureUuid, dateEndRegistration, dateSummingUp, procedureId) {
    const url = `requests/backoffice/procedures/${ procedureId }/prolong`;

    return this.api.post(url, { dateEndRegistration, dateSummingUp, procedureId });
  }

  cancelProcedure(procedureId, initiatorRole: UserRole, comment?: string) {
    const url = `requests/backoffice/procedures/${ procedureId }/cancel`;
    return this.api.post(url, { initiatorRole, comment });
  }

  getRequestsFromSuppliers(pageIndex: number, pageSize: number = 10, filters: ProceduresRequestsFilter): Observable<IProcedureRequestFromSupplier[]> {
    const url = `requests/backoffice/procedures/filter-explanations`;
    return this.api.post<IProcedureRequestFromSupplier[]>(url, {
      // @TODO реализовать пагинацию
      // pageIndex,
      // pageSize,
      // По-умолчанию показываем все запросы
      notAnswered: false,
      ...filters,
      explanationType: 'all'
    });
  }

  sendRequestAnswer(procedureExplanationId: string, answer: string, files: File[]): Observable<any> {
    const url = `requests/backoffice/procedures/${procedureExplanationId}/reply-doc-explanation`;
    const formData = this.formDataService.toFormData({
      procedureExplanationId,
      answer,
      files,
      isAnswer: true
    });
    return this.api.post<any>(url, formData);
  }

  getProposalAvailableFilters(tcpGroupId: string, offersApproveGroupId: Uuid): Observable<IAvailableProposalsFilters> {
    const url = `requests/backoffice/positions/${tcpGroupId}/proposals-available-filters`;
    return this.api.post<IAvailableProposalsFilters>(url, { offersApproveGroupId });
  }

  // Создание группы предложений
  createProposalGroup(
    name: string = null,
    useAllPositions: boolean = false,
    filters: IProposalsFilters = null,
    proposalIds: Uuid[],
    positionIds: Uuid[],
    positionTCPIds: Uuid[],
    schema: "AGENT" | "TRADE",
    approveType: "MATRIX" | "REFERENCE",
    isHideContragent: 'true' | 'false' = null,
    tcpGroupId: Uuid
  ) {
    const url = `requests/backoffice/offers-approve-groups/create`;
    return this.api.post(url, {
      name, useAllPositions, filters, proposalIds, positionIds, positionTCPIds, schema, approveType,
      isHideContragent: isHideContragent === 'true', tcpGroupId
    });
  }

  getOffersApproveGroups(tcpGroupId: Uuid, procedureId?: Uuid, filters: IProposalsFilters = null) {
    const url = `requests/backoffice/offers-approve-groups`;
    return this.api.post(url, {tcpGroupId, procedureId, filters});
  }

  downloadTemplate(groupId: Uuid) {
    const url = `requests/backoffice/positions/${groupId}/proposals/download-excel-template`;
    return this.api.post(url, { groupId }, { responseType: 'blob' });
  }

  uploadTemplate(groupId: Uuid, files: File[]) {
    const url = `requests/backoffice/positions/${groupId}/proposals/upload-excel`;
    const data = { files, groupId };

    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData(data));
  }

  createProposal(groupId: Uuid, data: Partial<CommonProposal>) {
    const url = `requests/backoffice/positions/${groupId}/proposals/create`;
    return this.api.post<CommonProposal>(url, this.formDataService.toFormData({groupId, ...data}));
  }

  updateProposal(data: Partial<CommonProposal> & { id: Uuid }) {
    const url = `requests/backoffice/technical-commercial-proposals/${ data.id }/edit`;
    return this.api.post<CommonProposal>(url, this.formDataService.toFormData(data));
  }

  editItems(proposalId: Uuid, items: Partial<CommonProposalItem>[]) {
    const url = `requests/backoffice/technical-commercial-proposals/${ proposalId }/edit-offers`;
    return this.api.post<CommonProposalItem[]>(url, this.formDataService.toFormData({ items }));
  }

  publish(tcpGroupId: Uuid, proposalsIds: CommonProposalItem[], filters: IProposalsFilters = null) {
    const url = `requests/backoffice/technical-commercial-proposals/send-positions-to-review`;
    const positionIds = proposalsIds.map(position => position.id);

    return this.api.post<CommonProposalPayload>(url, { tcpGroupId, positionIds, filters });
  }

  toggleTCPisFavorite(proposalId: Uuid, tcpPositionId: Uuid, isFavorite: boolean) {
    const url = `requests/backoffice/technical-commercial-proposals/${ proposalId }/change-position-is-favorite`;
    return this.api.post<CommonProposalItem[]>(url, { tcpPositionId, isFavorite });
  }

  downloadAnalyticReferenceByGroupId(groupId: Uuid) {
    const url = `requests/backoffice/offers-approve-groups/${groupId}/analytic-report/download-by-tcp`;
    return this.api.post(url, {}, { responseType: 'blob' });
  }

  downloadAnalyticReferenceByProcedureId(procedureId: Uuid) {
    const url = `requests/backoffice/procedures/${procedureId}/analytic-report/download-by-tcp`;
    return this.api.post(url, {}, { responseType: 'blob' });
  }

  uploadAnalyticReference(groupId: Uuid, analyticReportDocument: File) {
    const url =  `requests/backoffice/offers-approve-groups/${groupId}/upload-analytic-report-by-tcp`;
    return this.api.post(url, this.formDataService.toFormData({ analyticReportDocument: [analyticReportDocument] }));
  }

  removeAnalyticReference(groupId: Uuid) {
    const url =  `requests/backoffice/offers-approve-groups/${groupId}/remove-analytic-report-by-tcp`;
    return this.api.post(url, {});
  }

  addOfferIncrease(offersApproveGroupId: Uuid, positionTCPIds: Uuid[], percent: number, absolute: number, useAllPositions: boolean) {
    const url =  `requests/backoffice/offer/increase`;
    return this.api.post<any>(url, { offersApproveGroupId, positionTCPIds: useAllPositions ? [] : positionTCPIds, percent, absolute, useAllPositions });
  }

  dateEndRegistrationFinished(procedure: Procedure): boolean {
    return moment(procedure?.dateEndRegistration?.date).isBefore();
  }

  dateSummingUpFinished(procedure: Procedure): boolean {
    return moment(procedure?.dateSummingUp?.date).isBefore();
  }

  isProcedureMayBeAssigned(procedure: Procedure) {
    return !procedure.isCanceled;
  }


}
