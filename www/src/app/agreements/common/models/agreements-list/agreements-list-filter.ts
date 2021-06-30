import { Uuid } from "../../../../cart/models/uuid";

export class AgreementsListFilter {
  actions?: string[];
  numberOrName?: string;
  issuedDateFrom?: string;
  issuedDateTo?: string;
  contragents?: Uuid[];
}
