import {Uuid} from "../../../cart/models/uuid";
import { TechnicalProposalPosition } from "./technical-proposal-position";
import { RequestDocument } from "./request-document";
import { ContragentInfo } from "../../../contragent/models/contragent-info";

export class CommercialProposal {
  id: Uuid;
  name: string;
  supplierContragent: ContragentInfo;
  createdDate: Date;
  updatedDate: Date;
  documents: RequestDocument[];
  positions: TechnicalProposalPosition[];
  status: string;
  statusChangedDate: Date;

  supplierContragentName: string;
  supplierContragentId: Uuid;
  priceWithVat: string;
  paymentTerms: string;
  deliveryDate: string;
  measureUnit: string;
  quantity: string;
  currency: string;
}
