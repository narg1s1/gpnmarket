import { RequestOfferPosition } from "../../common/models/request-offer-position";
import { RequestPosition } from "../../common/models/request-position";
import { SupplierCommercialProposalInfo } from "./supplier-commercial-proposal-info";

export class CommercialProposal {
  supplier: SupplierCommercialProposalInfo;
  items: {
    linkedOffer: RequestOfferPosition,
    position: RequestPosition
  }[];
}
