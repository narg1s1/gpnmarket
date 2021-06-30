import { OffersApproveGroupModel } from './../../../procedure/models/offers-approve-group.model';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { TechnicalCommercialProposalService } from "../services/technical-commercial-proposal.service";
import { delayWhen, switchMap, tap } from "rxjs/operators";
import { TechnicalCommercialProposals } from "../actions/technical-commercial-proposal.actions";
import { patch, updateItem } from "@ngxs/store/operators";
import { StateStatus } from "../../common/models/state-status";
import { Injectable } from "@angular/core";
import { RequestPosition } from "../../common/models/request-position";
import { saveAs } from 'file-saver/src/FileSaver';
import { Procedure } from "../models/procedure";
import { ProcedureService } from "../services/procedure.service";
import { ProposalSource } from "../enum/proposal-source";
import { CommonProposal, CommonProposalByPosition } from "../../common/models/common-proposal";
import { insertOrUpdateProposals } from "../../../shared/state-operators/insert-or-update-proposals";
import { of } from "rxjs";
import Fetch = TechnicalCommercialProposals.Fetch;
import FetchAvailablePositions = TechnicalCommercialProposals.FetchAvailablePositions;
import FetchProcedureCreationPositions = TechnicalCommercialProposals.FetchProcedureCreationPositions;
import FetchProcedures = TechnicalCommercialProposals.FetchProcedures;
import RefreshProcedures = TechnicalCommercialProposals.RefreshProcedures;
import Create = TechnicalCommercialProposals.Create;
import Update = TechnicalCommercialProposals.Update;
import UpdateItems = TechnicalCommercialProposals.UpdateItems;
import DownloadAnalyticalReport = TechnicalCommercialProposals.DownloadAnalyticalReport;
import DownloadTemplate = TechnicalCommercialProposals.DownloadTemplate;
import UploadTemplate = TechnicalCommercialProposals.UploadTemplate;
import Rollback = TechnicalCommercialProposals.Rollback;
import Publish = TechnicalCommercialProposals.Publish;
import FetchAvailableRequestPositionsDocuments = TechnicalCommercialProposals.FetchAvailableRequestPositionsDocuments;
import { RequestDocument } from "../../common/models/request-document";

export interface TechnicalCommercialProposalStateModel {
  proposals: CommonProposal[];
  status: StateStatus;
  procedures: Procedure[];
  positions: RequestPosition[];
  availablePositions: RequestPosition[];
  procedureCreationPositions?: RequestPosition[];
  procedureCreationAvailableDocuments?: RequestDocument[];
  allowCreate?: boolean;
}

type Model = TechnicalCommercialProposalStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'BackofficeTechnicalCommercialProposals',
  defaults: {
    proposals: null,
    availablePositions: null,
    procedureCreationPositions: null,
    procedureCreationAvailableDocuments: null,
    allowCreate: false,
    positions: null,
    procedures: null,
    status: "pristine"
  }
})
@Injectable()
export class TechnicalCommercialProposalState {

  constructor(private rest: TechnicalCommercialProposalService, private procedureService: ProcedureService) {
  }

  @Selector() static proposals({ proposals }: Model) { return proposals; }
  @Selector() static allowCreate({ allowCreate }: Model) { return allowCreate; }
  @Selector() static availablePositions({ availablePositions }: Model) { return availablePositions; }
  @Selector() static procedureCreationPositions({ procedureCreationPositions }: Model) { return procedureCreationPositions; }
  @Selector() static procedureCreationAvailableDocuments({ procedureCreationAvailableDocuments }: Model) { return procedureCreationAvailableDocuments; }
  @Selector() static status({ status }: Model) { return status; }
  @Selector() static procedures({ procedures }: Model) { return procedures; }
  @Selector() static positions({ positions }: Model) { return positions; }
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

  @Action(Fetch)
  fetch({ setState, dispatch }: Context, { requestId, groupId }: Fetch) {
    setState(patch<Model>({ proposals: null, status: "fetching" }));

    return this.rest.list(requestId, groupId).pipe(
      switchMap(({ proposals, positions }) => dispatch(new FetchProcedures(requestId, groupId)).pipe(
        tap(() => setState(patch<Model>({ proposals, positions, status: "received" }))))
      ),
    );
  }

  @Action(FetchAvailablePositions, { cancelUncompleted: true })
  fetchAvailablePositions({ setState }: Context, { requestId, groupId, positionNameOrNumber, payload }: FetchAvailablePositions) {
    setState(patch({ availablePositions: null }));

    return this.rest.availablePositions(requestId, groupId, positionNameOrNumber, payload).pipe(
      tap(availablePositions => setState(patch({ availablePositions }))),
      tap(p => {if (!positionNameOrNumber) { setState(patch({ allowCreate: p.length > 0 })); }}),
    );
  }

  @Action(FetchProcedureCreationPositions, { cancelUncompleted: true })
  fetchProcedureCreationPositions({ setState }: Context, { requestId, groupId, search, payload }: FetchProcedureCreationPositions) {
    setState(patch({ procedureCreationPositions: null }));

    return this.rest.availablePositions(requestId, groupId, search, payload).pipe(
      tap(procedureCreationPositions => setState(patch({ procedureCreationPositions }))),
    );
  }

  @Action(FetchAvailableRequestPositionsDocuments, { cancelUncompleted: true })
  fetchAvailableRequestPositionsDocuments({ setState }: Context, { requestId, groupId, payload }: FetchAvailableRequestPositionsDocuments) {
    setState(patch({ procedureCreationAvailableDocuments: null }));

    return this.rest.availableDocuments(requestId, groupId, payload).pipe(
      tap(procedureCreationAvailableDocuments => setState(patch({ procedureCreationAvailableDocuments }))),
    );
  }

  @Action([FetchProcedures, RefreshProcedures])
  fetchProcedures({ setState }: Context, { requestId, groupId, update }: FetchProcedures) {
    setState(patch<Model>(update ? { status: "updating" } : { procedures: null, status: "fetching" }));

    return this.procedureService.list(requestId, ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL, groupId).pipe(
      tap(procedures => setState(patch({ procedures }))),
      tap(() => setState(patch<Model>(update ? { status: "received" } : {}))),
    );
  }

  @Action(Create)
  create({ setState, dispatch }: Context, { requestId, groupId, payload, items }: Create) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.create(requestId, groupId, payload).pipe(
      delayWhen(() => dispatch(new FetchAvailablePositions(requestId, groupId))),
      tap(proposal => setState(insertOrUpdateProposals({ proposals: [proposal] }))),
      switchMap(({ id }) => !!items?.length ? dispatch(new UpdateItems(id, items)) : of(null))
    );
  }

  @Action(Update)
  update({ setState, dispatch }: Context, { requestId, groupId, payload, items }: Update) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.update(payload).pipe(
      delayWhen(() => dispatch(new FetchAvailablePositions(requestId, groupId))),
      tap(proposal => setState(insertOrUpdateProposals({ proposals: [proposal] }))),
      switchMap(({ id }) => !!items?.length ? dispatch(new UpdateItems(id, items)) : of(null))
    );
  }

  @Action(UpdateItems)
  updateItems({ setState }: Context, { proposalId, payload }: UpdateItems) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.editItems(proposalId, payload).pipe(tap(items => setState(patch<Model>({
      proposals: updateItem(p => p.id === proposalId, patch({ items })),
      status: "received"
    }))));
  }

  @Action(Publish)
  publish({ setState, dispatch }: Context, { requestId, groupId, proposalsByPositions }: Publish) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.publish(requestId, groupId, proposalsByPositions.reduce((ids, { items }) => [...ids, ...items.map(({ id }) => id)], [])).pipe(
      delayWhen(() => dispatch(new FetchAvailablePositions(requestId, groupId))),
      tap(data => setState(insertOrUpdateProposals(data)))
    );
  }

  @Action(DownloadTemplate)
  downloadTemplate(ctx: Context, { requestId, groupId }: DownloadTemplate) {
    return this.rest.downloadTemplate(requestId, groupId)
      .pipe(tap(data => saveAs(data, `RequestTechnicalCommercialProposalsTemplate.xlsx`)));
  }

  @Action(UploadTemplate)
  uploadTemplate({ setState, dispatch }: Context, { requestId, groupId, files, groupName }: UploadTemplate) {
    setState(patch<Model>({ status: "updating" }));

    const uploadTemplate = this.rest.uploadTemplate(requestId, groupId, files).pipe(
      delayWhen(() => dispatch(new FetchAvailablePositions(requestId, groupId))),
      tap(data => setState(insertOrUpdateProposals(data)))
    );

    const uploadTemplateFromGroups = this.rest.uploadTemplateFromGroups(requestId, files, groupName);

    return groupId ? uploadTemplate : uploadTemplateFromGroups;
  }

  @Action(DownloadAnalyticalReport)
  downloadAnalyticalReport(ctx: Context, { requestId }: DownloadAnalyticalReport) {
    return this.rest.downloadAnalyticalReport(requestId)
      .pipe(tap((data) => saveAs(data, `Аналитическая справка.xlsx`)));
  }

  @Action(Rollback)
  rollback({ setState, dispatch }: Context, { requestId, groupId, positionId }: Rollback) {
    setState(patch<Model>({ status: "updating" }));

    return this.rest.rollback(requestId, groupId, positionId).pipe(
      delayWhen(() => dispatch(new FetchAvailablePositions(requestId, groupId))),
      tap(data => setState(insertOrUpdateProposals(data)))
    );
  }
}
