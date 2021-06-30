import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { CommonProposalItem } from "../../common/models/common-proposal";

export namespace TechnicalCommercialProposals {
  // Получить список
  export class Fetch {
    static readonly type = '[Technical Commercial Proposals Customer] Fetch';
    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }

  // Рассмотреть предложения
  export class Review {
    static readonly type = '[Technical Commercial Proposals Customer] Review';
    constructor(public proposalItems: CommonProposalItem[], public positions: RequestPosition[], public offersApproveGroupId: Uuid, public sendToEditComment: string = null) {}
  }

  // Скачать аналитическую справку
  export class DownloadAnalyticalReport {
    static readonly type = '[Technical Commercial Proposals Customer] DownloadAnalyticalReport';

    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }
}
