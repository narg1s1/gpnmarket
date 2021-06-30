import { OffersApproveGroupModel } from '../models/offers-approve-group.model';
import { IAvailableProposalsFilters } from './../models/proposals-filters';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { StateStatus } from "../models/state-status";
import { Injectable } from "@angular/core";
import { saveAs } from 'file-saver/src/FileSaver';
import { switchMap, tap } from "rxjs/operators";
import { patch, updateItem } from "@ngxs/store/operators";
import { Procedure } from "../../request/back-office/models/procedure";
import { ProcedureService } from "../../request/back-office/services/procedure.service";
import { ProcedureActions } from "../actions/procedure.actions";
import { RequestPosition } from "../../request/common/models/request-position";
import { CommonProposal, CommonProposalByPosition } from "../../request/common/models/common-proposal";
import FetchProcedure = ProcedureActions.FetchProcedure;
import FetchProposals = ProcedureActions.FetchProposals;
import { insertOrUpdateProposals } from "../../shared/state-operators/insert-or-update-proposals";
import { of } from "rxjs";
import CreateProposal = ProcedureActions.CreateProposal;
import UpdateProposal = ProcedureActions.UpdateProposal;
import UpdateItems = ProcedureActions.UpdateItems;
import DownloadTemplate = ProcedureActions.DownloadTemplate;
import UploadTemplate = ProcedureActions.UploadTemplate;
import Publish = ProcedureActions.Publish;


export interface ProcedureStateStateModel {
  positions?: RequestPosition[];
  procedure?: Procedure;
  proposals?: CommonProposal[];
  status: StateStatus;
  proposalAvailableFilters: IAvailableProposalsFilters;
  offersApproveGroups: OffersApproveGroupModel[];
  offersApproveGroup: OffersApproveGroupModel;
  isCanApprove?: boolean;
}

type Model = ProcedureStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'BackofficeProcedure',
  defaults: {
    positions: [],
    procedure: null,
    proposals: [],
    status: "pristine",
    proposalAvailableFilters: null,
    offersApproveGroups: [],
    offersApproveGroup: null,
    isCanApprove: null
  }
})
@Injectable()
export class ProcedureState {
  constructor(private rest: ProcedureService) {}

  @Selector() static procedure({procedure}: Model) { return procedure; }
  @Selector() static proposals({proposals}: Model) { return proposals; }
  @Selector() static positions({positions}: Model) { return positions; }
  @Selector() static offersApproveGroups({offersApproveGroups}: Model) { return offersApproveGroups; }
  @Selector() static offersApproveGroup({offersApproveGroup}: Model) { return offersApproveGroup; }
  @Selector() static status({status}: Model) { return status; }
  @Selector() static availableFilters({proposalAvailableFilters}: Model) { return proposalAvailableFilters; }
  @Selector() static proposalsByPositions({ proposals, positions }: Model) {
    // Перегруппировываем ТКП попозиционно, включаем позиции по которым еще не создано ни одного ТКП
    return proposals.reduce((acc: CommonProposalByPosition[], proposal) => {
      proposal.items.forEach(item => {
        const proposalByPosition = acc.find(({ position: { id } }) => item.requestPositionId === id);
        if (proposalByPosition) {
          proposalByPosition.items.push(item);
        } else {
          const position = positions.find(({ id }) => item.requestPositionId === id);
          acc.push({ position, items: [item] });
        }
      });

      return acc;
    }, positions?.map(position => ({ position, items: [] })) || []);
  }
  @Selector() static isCanApprove({isCanApprove}: Model) { return isCanApprove; }

  @Action(FetchProcedure) fetchProcedure({setState}: Context, {procedureUid, clearState}: FetchProcedure) {

    if (clearState) {
      setState(patch({ procedure: null, status: "fetching" as StateStatus }));
    }

    return this.rest.getProcedureInfo(procedureUid).pipe(
      tap(procedure => {
        const positionArr  = [];

        for (const positionId of Object.keys(procedure.positions)) {
          const position  = procedure.positions[positionId];
          positionArr.push({
            contragent: {},
            id: '',
            lotId: procedure.lotId,
            procedureId: procedure.procedureId,
            requestPosition: new RequestPosition(position),
            requestPositionId: position.id,
            requestProcedureId: procedure.id,
            unitId: '',
          });
        }
        procedure.positions = positionArr;
        setState(patch({procedure, status: "received" as StateStatus}));
      }),
    );
  }

  @Action(FetchProposals) fetchProposals({setState}: Context, {groupId, clearState, filters}: FetchProposals) {
    if (clearState) {
      setState(patch({ positions: null, proposals: null, offersApproveGroup: null, status: "fetching" as StateStatus }));
    }

    return this.rest.getCompositeProcedureData(groupId, filters).pipe(
      tap(response => {
        const positions = response.positions;
        const proposals = response.proposals;
        const offersApproveGroup = response.offersApproveGroup;
        const isCanApprove = response.isCanApprove;

        setState(patch({positions, proposals, offersApproveGroup, status: "received" as StateStatus, isCanApprove}));
      }),
    );
  }

  // Получение доступных фильтров на странице Предложения поставщиков
  @Action(ProcedureActions.FetchProposalAvailableFilters) fetchFilters({setState}: Context, {tcpGroupId, offersApproveGroupId}: ProcedureActions.FetchProposalAvailableFilters) {
    return this.rest.getProposalAvailableFilters(tcpGroupId, offersApproveGroupId).pipe(
      tap((filters: IAvailableProposalsFilters) => setState(patch({proposalAvailableFilters: filters})))
      );
  }

  // Список групп предложений
  @Action(ProcedureActions.FetchOffersApproveGroups)
  fetchOffersApproveGroups({setState}: Context, {tcpGroupId, procedureId, filters}: ProcedureActions.FetchOffersApproveGroups) {
    return this.rest.getOffersApproveGroups(tcpGroupId, procedureId, filters).pipe(
      tap((offersApproveGroups: OffersApproveGroupModel[]) => setState(patch({offersApproveGroups: offersApproveGroups})))
    );
  }

  @Action(DownloadTemplate)
  downloadTemplate(ctx: Context, { groupId }: DownloadTemplate) {
    return this.rest.downloadTemplate(groupId)
      .pipe(tap(data => saveAs(data, `RequestTechnicalCommercialProposalsTemplate.xlsx`)));
  }

  @Action(UploadTemplate)
  uploadTemplate({ setState, dispatch }: Context, { groupId, files }: UploadTemplate) {
    setState(patch<Model>({ status: "updating" }));

    return  this.rest.uploadTemplate(groupId, files).pipe(
      tap(data => setState(insertOrUpdateProposals(data)))
    );
  }

  @Action(CreateProposal)
  createProposal({ setState, dispatch }: Context, { groupId, payload, items }: CreateProposal) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.createProposal(groupId, payload).pipe(
      tap(proposal => setState(insertOrUpdateProposals({ proposals: [proposal] }))),
      switchMap(({ id }) => !!items?.length ? dispatch(new UpdateItems(id, items)) : of(null))
    );
  }

  @Action(UpdateProposal)
  updateProposal({ setState, dispatch }: Context, { groupId, payload, items }: UpdateProposal) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.updateProposal(payload).pipe(
      tap(proposal => setState(insertOrUpdateProposals({ proposals: [proposal] }))),
      switchMap(({ id }) => !!items?.length ? dispatch(new UpdateItems(id, items)) : of(null))
    );
  }

  @Action(UpdateItems)
  updateItems({ setState }: Context, { proposalId, payload }: UpdateItems) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.editItems(proposalId, payload).pipe(tap(items => {
      setState(patch<Model>({
        proposals: updateItem(p => p.id === proposalId, patch({ items })),
        status: "received"
      }));
    }));
  }

  @Action(Publish)
  publish({ setState, dispatch }: Context, { groupId, proposals, filters }: Publish) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.publish(groupId, proposals, filters).pipe(
      tap(data => setState(insertOrUpdateProposals(data)))
    );
  }
}
