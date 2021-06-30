import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { CommercialProposals } from "../actions/commercial-proposal.actions";
import { patch } from "@ngxs/store/operators";
import { saveAs } from 'file-saver/src/FileSaver';
import { StateStatus } from "../../common/models/state-status";
import { CommercialProposalsService } from "../services/commercial-proposals.service";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { CommonProposal, CommonProposalByPosition, CommonProposalItemStatus } from "../../common/models/common-proposal";
import { RequestPosition } from "../../common/models/request-position";
import { insertOrUpdateProposals } from "../../../shared/state-operators/insert-or-update-proposals";
import Fetch = CommercialProposals.Fetch;
import Review = CommercialProposals.Review;
import DownloadAnalyticalReport = CommercialProposals.DownloadAnalyticalReport;

export interface CommercialProposalStateModel {
  positions: RequestPosition[];
  proposals: CommonProposal[];
  status: StateStatus;
}

type Model = CommercialProposalStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerCommercialProposals',
  defaults: { proposals: null, positions: null, status: "pristine" }
})
@Injectable()
export class CommercialProposalState {
  constructor(private rest: CommercialProposalsService) {}

  static proposalsByPos(status: CommonProposalItemStatus[]) {
    return createSelector(
      [CommercialProposalState],
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
        .filter(({ items }) => items.every((item) => status.includes(item.status)))
    );
  }

  static proposalsByStatus(status?: CommonProposalItemStatus[]) {
    return createSelector([CommercialProposalState], ({ proposals }: Model) => proposals
      .filter(({ items }) => items.some((item) => status.includes(item.status)))
    );
  }

  @Selector() static status({ status }: Model) { return status; }
  @Selector() static proposals({ proposals }: Model) { return proposals; }
  @Selector() static positions({ positions }: Model) { return positions; }

  @Action(Fetch)
  fetch({ setState }: Context, { requestId, groupId }: Fetch) {
    setState(patch<Model>({ proposals: null, status: "fetching" }));
    return this.rest.list(requestId, groupId).pipe(
      tap(({ proposals, positions }) => setState(patch<Model>({ proposals, positions, status: "received" })))
    );
  }

  @Action(Review)
  review({ setState, getState }: Context, { requestId, proposalItems, positions }: Review) {
    setState(patch({ status: "updating" as StateStatus }));

    return this.rest.review(requestId, {
      'accepted': proposalItems?.map(({ id }) => id),
      'sendToEdit': positions?.map(({ id }) => id)
    }).pipe(tap(data => setState(insertOrUpdateProposals(data))));
  }

  @Action(DownloadAnalyticalReport)
  downloadAnalyticalReport(ctx: Context, { requestId, groupId }: DownloadAnalyticalReport) {
    return this.rest.downloadAnalyticalReport(requestId, groupId).pipe(
      tap((data) => saveAs(data, `Аналитическая справка.xlsx`))
    );
  }
}
