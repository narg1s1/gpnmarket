import { TechnicalCommercialProposal } from "./technical-commercial-proposal";
import { TechnicalCommercialProposalPosition } from "./technical-commercial-proposal-position";
import { RequestPosition } from "./request-position";

export class TechnicalCommercialProposalByPosition {
  position: RequestPosition;
  data: {
    proposalPosition: TechnicalCommercialProposalPosition;
    proposal: TechnicalCommercialProposal;
  }[];
}
