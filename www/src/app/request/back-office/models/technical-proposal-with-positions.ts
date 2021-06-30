import { TechnicalProposal } from "../../common/models/technical-proposal";
import { RequestPosition } from "../../common/models/request-position";

export class TechnicalProposalWithPositions {
  requestTechnicalProposal: TechnicalProposal;
  positions: RequestPosition[];
}
