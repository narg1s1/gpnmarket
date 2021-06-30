import { Uuid } from "../../../cart/models/uuid";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { TechnicalCommercialProposalStatus } from "../enum/technical-commercial-proposal-status";
import { TechnicalCommercialProposalStatusLabel } from "../enum/technical-commercial-proposal-status-label";
import { RequestDocument } from "./request-document";
import { TechnicalCommercialProposalPosition } from "./technical-commercial-proposal-position";
import { ProposalWithCommonInfo } from "./proposal-with-common-info";
import { DeliveryType } from "../../back-office/enum/delivery-type";

export class TechnicalCommercialProposal implements ProposalWithCommonInfo {
  id: Uuid;
  supplier: ContragentShortInfo;
  name: string;
  positions: TechnicalCommercialProposalPosition[];
  documents: RequestDocument[];
  createdDate: string;
  status: TechnicalCommercialProposalStatus;
  statusLabel: TechnicalCommercialProposalStatusLabel;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  deliveryAdditionalTerms: string;
  warrantyConditions: string;
  deliveryPrice: number;
  deliveryCurrency: string;
  deliveryPickup: string;
}
