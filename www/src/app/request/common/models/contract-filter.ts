import { Uuid } from "../../../cart/models/uuid";
import { ContractStatus } from "../enum/contract-status";
import { ContragentList } from "../../../contragent/models/contragent-list";

export class ContractFilter<T extends ContragentList | Uuid = ContragentList> {
  positionName?: string;
  suppliers?: T[];
  statuses?: ContractStatus[];
}
