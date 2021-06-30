import { Uuid } from "../../cart/models/uuid";
import { EmployeeListRequestPosition } from "./employee-list-request-position";
import { RequestListItem } from "../../request/common/models/requests-list/requests-list-item";
import { ContragentInfoAddresses } from "../../contragent/models/contragent-info-address";
import { ContragentInfoBankRequisites } from "../../contragent/models/contragent-info-bank-requisites";
import { User } from "../../user/models/user";

export class EmployeeInfo {
  requestsWithResponsiblePositions: EmployeeInfoRequestItem[];
  responsibleRequests: EmployeeInfoRequestItem[];
  positions: EmployeeListRequestPosition[];
  user: EmployeeInfoBrief;

  constructor(params?: Partial<EmployeeInfo>) {
    Object.assign(this, params);
  }
}

export class EmployeeInfoRequestItem {
  request: RequestListItem;
  completedCount: number;
  positionCount: number;
}

export class EmployeeInfoBrief {
  id: Uuid;
  activated: boolean;
  firstName: string;
  fullName: string;
  lastName: string;
  middleName: string;
  phone: string;
  shortName: string;
  username: string;
  position: string;
  role?: string;
  roles?: any;
  taxAuthorityRegistrationDate?: Date;
  addresses?: ContragentInfoAddresses[];
  bankRequisites?: ContragentInfoBankRequisites[];
  responsible?: User;
}
