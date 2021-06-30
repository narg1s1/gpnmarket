import { CommonProposalPayload } from "../../request/common/models/common-proposal";
import { StateOperator } from "@ngxs/store";
import { TechnicalCommercialProposalStateModel } from "../../request/back-office/states/technical-commercial-proposal.state";
import { TechnicalCommercialProposalStateModel as TechnicalCommercialProposalStateModelCustomer } from "../../request/customer/states/technical-commercial-proposal.state";
import { CommercialProposalStateModel } from "../../request/back-office/states/commercial-proposal.state";
import { ProcedureStateStateModel } from "../../procedure/states/procedure.state";
type Model = TechnicalCommercialProposalStateModel & TechnicalCommercialProposalStateModelCustomer & CommercialProposalStateModel & ProcedureStateStateModel;

export function insertOrUpdateProposals({ positions, proposals }: CommonProposalPayload): StateOperator<Model> {
  return (state: Readonly<Model>) => ({
    ...state,
    status: "received",
    positions: (positions ?? []).reduce((updatedPositions, position) => {
      const i = updatedPositions.findIndex(({ id }) => id === position.id);
      i < 0 ? updatedPositions.push(position) : updatedPositions[i] = position;
      return updatedPositions;
    }, state.positions),
    proposals: (proposals ?? []).reduce((updatedProposals, proposal) => {
      const i = updatedProposals.findIndex(({ id }) => id === proposal.id);
      i < 0 ? updatedProposals.push(proposal) : updatedProposals[i] = proposal;
      return updatedProposals;
    }, state.proposals)
  });
}
