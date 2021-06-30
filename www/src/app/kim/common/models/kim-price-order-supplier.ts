import { EmployeeInfoBrief } from "../../../employee/models/employee-info";
import { Uuid } from "../../../cart/models/uuid";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { PositionCurrency } from "../../../request/common/enum/position-currency";
import { RequestDocument } from "../../../request/common/models/request-document";

export class KimPriceOrderSupplier {
  id: Uuid;
  userId: Uuid;
  user: EmployeeInfoBrief;
  supplierId: Uuid;
  supplier: ContragentShortInfo;
  currency: PositionCurrency;
  costWithoutVat: number;
  costWithVat: number;
  deliveryPrice: number;
  dateDelivery: string;
  createdDate: string;
  isSmallBusiness: boolean;
  isProducer: boolean;
  isAuthorizedDealer: boolean;
  comment: string | null;
  documents?: RequestDocument[];
}
