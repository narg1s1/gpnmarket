import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";

export class GridSupplier extends ContragentShortInfo {
  hasAnalogs: boolean;
  source?: 'MANUAL' | 'ETP';
}
