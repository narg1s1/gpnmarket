import { Uuid } from "../../cart/models/uuid";
import {User} from "../../user/models/user";

export class ContragentList {
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

  constructor(params?: Partial<ContragentList>) {
    Object.assign(this, params);
  }
}
