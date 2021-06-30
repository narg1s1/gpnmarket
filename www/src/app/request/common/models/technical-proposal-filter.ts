import { Uuid } from "../../../cart/models/uuid";
import { TechnicalProposalsStatus } from "../enum/technical-proposals-status";
import { ContragentInfo } from "../../../contragent/models/contragent-info";

export class TechnicalProposalFilter<T extends ContragentInfo | Uuid = ContragentInfo> {
  positionName?: string;
  contragents?: T[];
  tpStatus?: TechnicalProposalsStatus[];
}
