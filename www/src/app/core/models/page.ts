import { RequestStatusCount } from "../../request/common/models/requests-list/request-status-count";

export class Page<T> {
  totalCount: number;
  totalCountWithoutNotRelevantAndCanceled: number;
  isWithoutStartPrice: boolean;
  statusCounters: RequestStatusCount;
  entities: Array<T>;
  result: Array<T>;

  constructor(entities: Array<T>, totalCount: number, totalCountWithoutNotRelevantAndCanceled: number, statusCounters: RequestStatusCount, isWithoutStartPrice: boolean) {
    this.totalCount = totalCount;
    this.totalCountWithoutNotRelevantAndCanceled = totalCountWithoutNotRelevantAndCanceled;
    this.isWithoutStartPrice = isWithoutStartPrice;
    this.statusCounters = statusCounters;
    this.entities = entities;
  }
}
