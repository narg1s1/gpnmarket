import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { finalize, flatMap, map, tap } from "rxjs/operators";
import { TechnicalProposals } from "../actions/technical-proposal.actions";
import { patch } from "@ngxs/store/operators";
import { StateStatus } from "../../common/models/state-status";
import { Injectable } from "@angular/core";
import { TechnicalProposal } from "../../common/models/technical-proposal";
import { TechnicalProposalsStatus } from "../../common/enum/technical-proposals-status";
import { TechnicalProposalsService } from "../services/technical-proposals.service";
import { TechnicalProposalFilter } from "../../common/models/technical-proposal-filter";
import Fetch = TechnicalProposals.Fetch;
import Filter = TechnicalProposals.Filter;
import Approve = TechnicalProposals.Approve;
import Reject = TechnicalProposals.Reject;
import SendToEdit = TechnicalProposals.SendToEdit;
import FetchAvailableFilters = TechnicalProposals.FetchAvailableFilters;
import { Uuid } from "../../../cart/models/uuid";

export interface TechnicalProposalStateModel {
  proposals: TechnicalProposal[];
  availableFilters: TechnicalProposalFilter;
  filters: TechnicalProposalFilter<Uuid>;
  status: StateStatus;
}

type Model = TechnicalProposalStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerTechnicalProposals',
  defaults: { proposals: null, filters: null, availableFilters: null, status: "pristine" }
})
@Injectable()
export class TechnicalProposalState {
  constructor(private rest: TechnicalProposalsService) {}

  static proposalsByStatus = (statuses: TechnicalProposalsStatus[]) => createSelector([TechnicalProposalState],
    ({ proposals }: Model) => proposals.filter(proposal => statuses.indexOf(proposal.status) > -1))

  @Selector() static status({ status }: Model) { return status; }
  @Selector() static proposals({ proposals }: Model) { return proposals; }
  @Selector() static proposalsLength({ proposals }: Model) { return proposals.length; }
  @Selector() static availableFilters({ availableFilters }: Model) { return availableFilters; }

  @Action([Fetch, Filter])
  fetch({ setState }: Context, { requestId, filters }: Fetch & Filter) {
    setState(patch<Model>(!filters ? { status: 'fetching', proposals: null } : { filters, status: 'updating'}));

    return this.rest.list(requestId, filters).pipe(
      tap(proposals => setState(patch<Model>({ proposals, status: "received" })))
    );
  }

  @Action(FetchAvailableFilters)
  fetchAvailableFilters({ setState, getState }: Context, { requestId }: FetchAvailableFilters) {
    return this.rest.availableFilters(requestId).pipe(tap(availableFilters => setState(patch({ availableFilters }))));
  }

  @Action(Approve)
  approve({ setState, getState, dispatch }: Context, { requestId, technicalProposalId, proposalPositions }: Approve) {

    setState(patch<Model>({ status: "updating" }));
    return this.rest.accept(requestId, technicalProposalId, proposalPositions).pipe(
      flatMap(() => dispatch([new Filter(requestId, getState().filters), new FetchAvailableFilters(requestId)])),
      finalize(() => setState(patch<Model>({ status: "received" }))),
    );
  }

  @Action(Reject)
  reject({ setState, getState, dispatch }: Context, { requestId, technicalProposalId, proposalPositions, comment }: Reject) {
    setState(patch<Model>({ status: "updating" }));
    return this.rest.reject(requestId, technicalProposalId, proposalPositions, comment).pipe(
      flatMap(() => dispatch([new Filter(requestId, getState().filters), new FetchAvailableFilters(requestId)])),
      finalize(() => setState(patch<Model>({ status: "received" })))
    );
  }

  @Action(SendToEdit)
  sendToEdit({ setState, getState, dispatch }: Context, { requestId, technicalProposalId, proposalPositions, comment }: SendToEdit) {
    setState(patch<Model>({ status: "updating" }));
    return this.rest.sendToEdit(requestId, technicalProposalId, proposalPositions, comment).pipe(
      flatMap(() => dispatch([new Filter(requestId, getState().filters), new FetchAvailableFilters(requestId)])),
      finalize(() => setState(patch<Model>({ status: "received" })))
    );
  }
}
