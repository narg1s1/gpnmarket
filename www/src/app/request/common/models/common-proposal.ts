import { TechnicalCommercialProposalPositionStatus } from './../enum/technical-commercial-proposal-position-status';
import { Uuid } from "../../../cart/models/uuid";
import { DeliveryType } from "../../back-office/enum/delivery-type";
import { RequestDocument } from "./request-document";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { PositionCurrency } from "../enum/position-currency";
import { RequestPosition } from "./request-position";
import { OffersApproveGroupModel } from "../../../procedure/models/offers-approve-group.model";

export class CommonProposalPayload {
  positions?: RequestPosition[];
  proposals?: CommonProposal[];
  offersApproveGroup?: OffersApproveGroupModel;
  isCanApprove?: boolean;
}

export class CommonProposal {
  id: Uuid;
  createdDate: string;
  deliveryAdditionalTerms: string;
  deliveryCurrency: string;
  deliveryPickup: string;
  deliveryPrice: number;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  documents: RequestDocument[];
  items: CommonProposalItem[];
  supplier: ContragentShortInfo;
  supplierId?: Uuid; // При передаче данных на бэк при создании/редактировании
  warrantyConditions: string;
  source?: 'ETP' | 'MANUAL';
}

export class CommonProposalItem {
  id: Uuid;
  comments: string;
  createdDate: string;
  currency: PositionCurrency;
  deliveryDate: string;
  isAnalog: boolean;
  isWinner: boolean;
  inQueue?: boolean;
  inGroup?: boolean;
  manufacturer: string;
  manufacturingName?: string;
  measureUnit: string;
  paymentTerms: string;
  priceWithoutVat: number;
  priceWithVat: number;
  quantity: number;
  requestId: Uuid;
  requestPositionId: Uuid;
  source?: "MANUAL"|"ETP";
  standard: string;
  status: CommonProposalItemStatus;
  supplierContragent: ContragentShortInfo;
  vatPercent: number;
  increase?: {type: "ABSOLUTE" | "RELATIVE", value: string};
  increasedPriceWithVat?: number;
  increasedPriceWithoutVat?: number;
  _disabled?: boolean;
  _selected?: boolean;
}

export class CommonProposalByPosition {
  id?: Uuid;
  position: RequestPosition;
  items: CommonProposalItem[];
}

// @TODO: убрать дублирующие статусы
export type CommonProposalItemStatus =
  'DRAFT' | 'NEW' | // Черновик
  'PROCEDURE_IN_PROGRESS' | // Идет процедура
  'REJECTED' | // Отклонено
  'SENT_TO_REVIEW' | // Отправлено на согласование
  'SENT_TO_EDIT' | // Отправлено на доработку
  'APPROVED' | 'REVIEWED' | // Рассмотрено
  'PARTIALLY_REVIEWED'; // Частично рассмотрено
