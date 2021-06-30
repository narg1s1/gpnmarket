import {Uuid} from "../../../cart/models/uuid";
import { TechnicalProposalPosition } from "./technical-proposal-position";
import { RequestDocument } from "./request-document";
import { ContragentInfo } from "../../../contragent/models/contragent-info";
import { TechnicalProposalsStatus } from "../enum/technical-proposals-status";

export class TechnicalProposal {
  id: Uuid;
  name: string;
  supplierContragent: ContragentInfo;
  createdDate: Date;
  updatedDate: Date;
  documents: RequestDocument[];
  positions: TechnicalProposalPosition[];
  status: TechnicalProposalsStatus;
  statusChangedDate: Date;
}
