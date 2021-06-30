import { Uuid } from "../../cart/models/uuid";

export class EmployeeShortInfo {
  id: Uuid;
  fullName: string;
  shortName: string;
  inn: string;
  kpp: string;
  email: string;
}

