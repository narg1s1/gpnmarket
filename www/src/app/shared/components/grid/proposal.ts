import { PositionCurrency } from "../../../request/common/enum/position-currency";
import { Uuid } from "../../../cart/models/uuid";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { RequestDocument } from "../../../request/common/models/request-document";
import { TechnicalCommercialProposalStatus } from 'src/app/request/common/enum/technical-commercial-proposal-status';

export class Proposal<T = any> {
  id: Uuid;
  deliveryDate: string;
  quantity: number;
  currency: PositionCurrency;
  priceWithoutVat: number;
  isWinner: boolean;
  isAnalog: boolean;
  inQueue?: boolean;
  inGroup?: boolean;
  isFavorite?: boolean;
  measureUnit: string;
  documents?: RequestDocument[];
  manufacturingName?: string;
  source?: "ETP"|"MANUAL";
  supplier?: ContragentShortInfo;
  supplierContragent?: ContragentShortInfo;
  status?: TechnicalCommercialProposalStatus;
  requestPositionId?: Uuid;
  increase?: {type: "ABSOLUTE" | "RELATIVE", value: string};
  increasedPriceWithVat?: number;
  increasedPriceWithoutVat?: number;

  constructor(public sourceProposal?: T, toProposalFn?: (sourceProposal: T) => Proposal<T>) {
    Object.assign(this, (toProposalFn && toProposalFn(sourceProposal)) ?? sourceProposal);
  }
}
