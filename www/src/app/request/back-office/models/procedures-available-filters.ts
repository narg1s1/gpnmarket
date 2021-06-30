import { ProceduresStatusList } from "./procedures-status-list";
import { Okpd2Item } from "../../../core/models/okpd2-item";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { EmployeeInfoBrief } from "../../../employee/models/employee-info";

export class ProceduresAvailableFilters {
  okpd2: Okpd2Item[];
  status: ProceduresStatusList[];
  contragents: ContragentShortInfo[];
  users: EmployeeInfoBrief[];
}
