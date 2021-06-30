import { Uuid } from "../../../cart/models/uuid";
import { Request } from "../../../request/common/models/request";
import { PositionStatus } from "../../../request/common/enum/position-status";
import { AgreementAction } from "../../back-office/enum/agreement-action";
import { TechnicalProposal } from "../../../request/common/models/technical-proposal";

export class Agreement {
  id: Uuid;
  type: string;
  action: {
    name: AgreementAction;
    label: string;
  };
  issuedDate: string;
  request: Request;
  groupCounter: number;
  requestTechnicalProposal?: TechnicalProposal;
  positionsStatus: {
    name: PositionStatus;
    label: string;
  };
  requestTechnicalCommercialProposalGroup?: {
    createdDate: string;
    id: Uuid;
    name: string;
    requestId: Uuid;
    offersApproveGroupId: Uuid;
    requestPositions: [{
      id: Uuid;
      name: string;
      status: PositionStatus;
      statusLabel: string;
      number: number;
    }]
  };
  requestPosition: {
    id: Uuid;
    name: string;
    status: PositionStatus;
    number: number;
  };
}
