import { Uuid } from "../../../cart/models/uuid";
import { KimPriceOrderStatus } from "../enum/kim-price-order-status";
import { KimPriceOrderPosition } from "./kim-price-order-position";
import { OkatoRegionCode } from "../../../shared/models/okato-region";
import { EmployeeInfoBrief } from "../../../employee/models/employee-info";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { KimPriceOrderType } from "../enum/kim-price-order-type";
import { KimPriceOrderSupplier } from "./kim-price-order-supplier";

export class KimPriceOrder {
  id: Uuid;
  etpKimId: number;
  userId: Uuid;
  user: EmployeeInfoBrief;
  contragentId: Uuid;
  contragent: ContragentShortInfo;
  name: string;
  deliveryAddress: string;
  deliveryConditions: string;
  dateResponse: string;
  dateDelivery: string;
  isForSmallBusiness: boolean;
  isForProducer: boolean;
  isForAuthorizedDealer: boolean;
  isRussianProduction: boolean;
  isDenyMaxPricePosition: boolean;
  regions: OkatoRegionCode;
  createdDate: string;
  status: KimPriceOrderStatus;
  statusLabel: string;
  type: KimPriceOrderType;
  proposalSuppliers?: KimPriceOrderSupplier[];
  positions: KimPriceOrderPosition[];
}
