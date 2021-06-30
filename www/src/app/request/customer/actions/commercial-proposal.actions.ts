import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { CommonProposalItem } from "../../common/models/common-proposal";

export namespace CommercialProposals {
  // Получить список
  export class Fetch {
    static readonly type = '[Commercial Proposals Customer] Fetch';
    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }

  // Рассмотреть предложения
  export class Review {
    static readonly type = '[Commercial Proposals Customer] Review';
    constructor(public requestId: Uuid, public proposalItems: CommonProposalItem[], public positions: RequestPosition[]) {}
  }

  // Скачать аналитическую справку
  export class DownloadAnalyticalReport {
    static readonly type = '[Commercial Proposals Customer] DownloadAnalyticalReport';

    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }
}
