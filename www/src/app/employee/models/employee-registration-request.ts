import {Uuid} from "../../cart/models/uuid";
import {User} from "../../user/models/user";

export class EmployeeRegistrationRequest {
  employee: EmployeeList;
  employeeAddress: EmployeeInfoAddresses;
  employeeBankRequisite: EmployeeInfoBankRequisites;
}

class EmployeeList {
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
}

class EmployeeInfoAddresses {
  id: Uuid;
  type: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postIndex: string;
  locality: string;
  createdDate: string;
}

export class EmployeeInfoBankRequisites {
  id: Uuid;
  createdDate: Date;
  account: string;
  correspondentAccount: string;
  bik: string;
  name: string;
  address: string;
}
