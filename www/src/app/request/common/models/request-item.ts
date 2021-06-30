import {RequestOfferPosition} from "./request-offer-position";
import {Uuid} from "../../../cart/models/uuid";

export class RequestItem {
  id: Uuid|null;
  name: string;
  productionDocument: string;
  measureUnit: string;
  quantity: string;
  deliveryDate: string;
  isDeliveryDateAsap: boolean;
  deliveryBasis: string;
  startPrice?: number;
  currency?: string;
  paymentTerms: string;
  relatedServices?: string;
  comments?: string;
  linkedOffers: RequestOfferPosition[];
  requestId?: Uuid;
}
