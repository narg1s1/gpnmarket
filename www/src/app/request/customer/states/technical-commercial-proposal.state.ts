import { OffersApproveGroupModel } from './../../../procedure/models/offers-approve-group.model';
import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { TechnicalCommercialProposals } from "../actions/technical-commercial-proposal.actions";
import { patch } from "@ngxs/store/operators";
import { saveAs } from 'file-saver/src/FileSaver';
import { StateStatus } from "../../common/models/state-status";
import { TechnicalCommercialProposalService } from "../services/technical-commercial-proposal.service";
import { Injectable } from "@angular/core";
import { CommonProposal, CommonProposalByPosition, CommonProposalItemStatus } from "../../common/models/common-proposal";
import { RequestPosition } from "../../common/models/request-position";
import { insertOrUpdateProposals } from "../../../shared/state-operators/insert-or-update-proposals";
import Fetch = TechnicalCommercialProposals.Fetch;
import Review = TechnicalCommercialProposals.Review;
import DownloadAnalyticalReport = TechnicalCommercialProposals.DownloadAnalyticalReport;

export interface TechnicalCommercialProposalStateModel {
  positions: RequestPosition[];
  proposals: CommonProposal[];
  status: StateStatus;
  offersApproveGroup: OffersApproveGroupModel;
  isCanApprove: boolean;
}

type Model = TechnicalCommercialProposalStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerTechnicalCommercialProposals',
  defaults: { proposals: null, positions: null, offersApproveGroup: null, isCanApprove: null, status: "pristine" }
})
@Injectable()
export class TechnicalCommercialProposalState {

  constructor(private rest: TechnicalCommercialProposalService) {}

  static proposalsByPos(status: CommonProposalItemStatus[]) {
    return createSelector(
      [TechnicalCommercialProposalState],
      ({ proposals, positions }: Model) => proposals
        .reduce((acc: CommonProposalByPosition[], proposal) => {
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
        }, [])
        .filter(({ items }) => items.some((item) => status.includes(item.status)))
    );
  }
  static proposalsByStatus(status?: CommonProposalItemStatus[]) {
    return createSelector([TechnicalCommercialProposalState], ({ proposals }: Model) => proposals
      .filter(({ items }) => items.some((item) => !status || status.includes(item.status)))
    );
  }

  @Selector() static status({ status }: Model) { return status; }
  @Selector() static proposals({ proposals }: Model) { return proposals; }
  @Selector() static positions({ positions }: Model) { return positions; }
  @Selector() static offersApproveGroup({offersApproveGroup}: Model) { return offersApproveGroup; }
  @Selector() static isCanApprove({ isCanApprove }: Model) { return isCanApprove; }

  @Action(Fetch)
  fetch({ setState }: Context, { requestId, groupId }: Fetch) {
    setState(patch<Model>({ proposals: null, status: "fetching" }));
    return this.rest.group(requestId, groupId).pipe(
      tap(({ proposals, positions, offersApproveGroup, isCanApprove }) => setState(patch<Model>({ proposals, positions, offersApproveGroup, isCanApprove, status: "received" })))
    );
  }

  @Action(Review)
  review({ setState, getState }: Context, { proposalItems, positions, offersApproveGroupId, sendToEditComment }: Review) {
    setState(patch({ status: "updating" as StateStatus }));

    return this.rest.review({
      'accepted': proposalItems?.filter(pos => pos !== null)?.map(({ id }) => id),
      'sendToEdit': positions?.filter(pos => pos !== null)?.map(({ id }) => id),
    }, offersApproveGroupId, sendToEditComment).pipe(tap((data) => setState(insertOrUpdateProposals(data))));
  }

  @Action(DownloadAnalyticalReport)
  downloadAnalyticalReport(ctx: Context, { requestId, groupId }: DownloadAnalyticalReport) {
    return this.rest.downloadAnalyticalReport(requestId, groupId).pipe(
      tap((data) => saveAs(data, `Аналитическая справка.xlsx`))
    );
  }
}
