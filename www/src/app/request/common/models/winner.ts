import { Uuid } from "../../../cart/models/uuid";
import { RequestOfferPosition } from "./request-offer-position";

export class Winner {
  id: Uuid;
  // TODO после введения ТКП это не жесткий RequestOfferPosition, а
  // аналог RequestCommercialProposalPositionMainInfoInterface на беке, пока не стал переделывать
  offerPosition: RequestOfferPosition;
}
