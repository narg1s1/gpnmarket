import { Okei, OkeiCode } from "../../../shared/models/okei";
import { Okpd2Code } from "../../../shared/models/okpd2";
import { Uuid } from "../../../cart/models/uuid";
import { KimPriceOrderProposal } from "./kim-price-order-proposal";

export class KimPriceOrderPosition {
  id: Uuid;
  name: string;
  okpd2: Okpd2Code;
  quantity: number;
  okei: OkeiCode;
  okeiItem: Okei;
  createdDate: string;
  maxPrice?: number;
  comments?: string;
  proposals?: KimPriceOrderProposal[];
}
