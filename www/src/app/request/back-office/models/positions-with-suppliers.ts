import { RequestPosition } from "../../common/models/request-position";
import { SupplierCommercialProposalInfo } from "./supplier-commercial-proposal-info";
import { CommercialProposalInfo } from "./commercial-proposal-info";

export class PositionsWithSuppliers {
  positions: RequestPosition[];
  requestOffers: CommercialProposalInfo;
  suppliers: SupplierCommercialProposalInfo[];
}
