import { Uuid } from "../../../cart/models/uuid";
import { PositionCurrency } from "../../../request/common/enum/position-currency";
import { KimPriceOrderSupplier } from "./kim-price-order-supplier";

export class KimPriceOrderProposal {
  id: Uuid;
  userId: Uuid;
  proposalSupplierId: Uuid;
  priceWithVat: number;
  priceWithoutVat: number;
  vatPercent: number;
  currency: PositionCurrency;
  quantity: number;
  createdDate: string;
  proposalSupplier: KimPriceOrderSupplier;
  isAnalog: boolean;
  isWinner: boolean;
}
