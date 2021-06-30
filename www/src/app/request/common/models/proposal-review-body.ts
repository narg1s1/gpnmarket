import { Uuid } from "../../../cart/models/uuid";

export class CommercialProposalReviewBody {
  accepted?: { [key in Uuid]: Uuid };
  sendToEdit?: Uuid[];
}
