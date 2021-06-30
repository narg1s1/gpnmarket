import { Uuid } from "../../../cart/models/uuid";

export class TechnicalProposalCreateRequest {
  id?: Uuid;
  contragentId: Uuid;
  positions: Uuid[];
}
