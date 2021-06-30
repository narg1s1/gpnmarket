import { Uuid } from "../../../cart/models/uuid";
import { RequestDocument } from "./request-document";
import { RequestPosition } from "./request-position";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { PositionCurrency } from "../enum/position-currency";
import { CommercialProposalsStatus } from "../enum/commercial-proposals-status";

export class RequestOfferPosition {
  comments?: string;
  createdDate?: string;
  customerContragentId?: string;
  deliveryDate: string;
  id: Uuid;
  paymentTerms?: string;
  priceWithVat: number;
  priceWithoutVat: number;
  quantity: number;
  currency: PositionCurrency;
  measureUnit: string;
  requestPosition: RequestPosition;
  requestId?: Uuid;
  requestLotId?: Uuid;
  requestPositionId?: Uuid;
  supplierContragentId?: Uuid;
  supplierContragentName?: string;
  supplierContragent?: ContragentShortInfo;
  userId?: Uuid;
  vatPercent: number;
  isAnalog: boolean;
  isMinPrice?: boolean;
  isWinner: boolean;
  documents?: RequestDocument[];
  technicalProposals?: RequestDocument[];
  status: CommercialProposalsStatus;
  manufacturer: string;
  standard: string;
}
