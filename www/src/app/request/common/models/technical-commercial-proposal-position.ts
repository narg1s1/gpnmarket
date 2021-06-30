import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "./request-position";
import { PositionCurrency } from "../enum/position-currency";
import { TechnicalCommercialProposalPositionStatus } from "../enum/technical-commercial-proposal-position-status";
import { TechnicalCommercialProposalPositionStatusLabel } from "../enum/technical-commercial-proposal-position-status-label";
import { CommonProposalItem, CommonProposalItemStatus } from "./common-proposal";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";

export class TechnicalCommercialProposalPosition implements CommonProposalItem {
  id: Uuid;
  proposalId: Uuid;
  manufacturingName: string;
  priceWithVat: number;
  priceWithoutVat: number;
  vatPercent: number | null;
  currency: PositionCurrency | null;
  quantity: number;
  measureUnit: string;
  okeiCode: string;
  deliveryDate: string | null;
  status: TechnicalCommercialProposalPositionStatus & CommonProposalItemStatus;
  statusLabel: TechnicalCommercialProposalPositionStatusLabel;
  position: RequestPosition;
  paymentTerms: string;
  isAnalog: boolean;
  inQueue?: boolean;
  manufacturer: string;
  standard: string;

  /**
   * @TODO: review it
   */
  isWinner: boolean;
  createdDate: string;
  requestId: Uuid;
  comments: string;
  supplierContragentId: Uuid;
  supplierContragent: ContragentShortInfo;
  requestPositionId: Uuid;
}
