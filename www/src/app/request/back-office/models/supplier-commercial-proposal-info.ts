import { Uuid } from "../../../cart/models/uuid";
import { User } from "../../../user/models/user";
import { ContragentList } from "../../../contragent/models/contragent-list";

export class SupplierCommercialProposalInfo implements ContragentList {
  id: Uuid|null;
  type: string;
  legalForm?: string;
  fullName: string;
  shortName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  taxAuthorityRegistrationDate?: Date;
  email: string;
  directorFullName?: string;
  phone: string;
  createdDate: Date;
  responsible?: User;
  role: string;

  documents: any;
  deliveryType: 'INCLUDED' | 'NOT_INCLUDED' | 'PICKUP';
  deliveryAdditionalTerms: string;
  warrantyConditions: string;
  deliveryPrice: number;
  deliveryCurrency: string;
  deliveryPickup: string;
}
