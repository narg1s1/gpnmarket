import { DeliveryType } from "../enum/delivery-type";
import { Uuid } from "../../../cart/models/uuid";
import { ProposalWithCommonInfo } from "../../common/models/proposal-with-common-info";
import { RequestDocument } from "../../common/models/request-document";

export class CommercialProposalInfo implements ProposalWithCommonInfo {
  id: Uuid;
  requestId: Uuid;
  supplierId: Uuid;
  createdDate: string;
  deliveryAdditionalTerms: string;
  deliveryCurrency: string;
  deliveryPickup: string;
  deliveryPrice: number;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  warrantyConditions: string;
  documents: RequestDocument[];
}
