import { Uuid } from "../../cart/models/uuid";
import { ContragentInfoAddresses } from "./contragent-info-address";
import { ContragentInfoBankRequisites } from "./contragent-info-bank-requisites";
import { User } from "../../user/models/user";
import { UsersGroup } from "../../core/models/users-group";
import { ContragentInfoContactData } from "./contragent-info-contract-data";

export class ContragentInfo {
  id: Uuid;
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
  updatedDate: Date;
  addresses?: ContragentInfoAddresses[];
  bankRequisites?: ContragentInfoBankRequisites[];
  contractData?: ContragentInfoContactData;
  responsible?: User;
  usersGroupId?: Uuid;
  usersGroup?: UsersGroup;
}
