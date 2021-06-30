import { Uuid } from "../../../cart/models/uuid";
import { DeliveryType } from "../../back-office/enum/delivery-type";
import { RequestDocument } from "./request-document";
import { TechnicalCommercialProposalPosition } from "./technical-commercial-proposal-position";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";

export class ProposalWithCommonInfo {
  id: Uuid;
  createdDate: string;
  deliveryAdditionalTerms: string;
  deliveryCurrency: string;
  deliveryPickup: string;
  deliveryPrice: number;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  warrantyConditions: string;
  documents: RequestDocument[];

  positions?: TechnicalCommercialProposalPosition[];
  supplier?: ContragentShortInfo;
  supplierId?: Uuid;
}
