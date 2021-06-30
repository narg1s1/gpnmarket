import { Uuid } from "../../../cart/models/uuid";
import { TechnicalProposalPosition } from "../../common/models/technical-proposal-position";
import { TechnicalProposalFilter } from "../../common/models/technical-proposal-filter";

export namespace TechnicalProposals {
  // Получить список ТП
  export class Fetch {
    static readonly type = '[Technical Proposals Customer] Fetch';
    constructor(public requestId: Uuid) {}
  }

  // Получить список доступных фильтров
  export class FetchAvailableFilters {
    static readonly type = '[Technical Proposals Customer] FetchAvailableFilters';
    constructor(public requestId: Uuid) {}
  }

  export class Filter {
    static readonly type = '[Technical Proposals Customer] Filter';
    constructor(public requestId: Uuid, public filters: TechnicalProposalFilter<Uuid>) {}
  }

  // Согласовать позицию ТП
  export class Approve {
    static readonly type = '[Technical Proposals Customer] Approve';
    constructor(public requestId: Uuid, public technicalProposalId: Uuid, public proposalPositions: TechnicalProposalPosition[]) {}
  }

  // Отклонить позицию ТП
  export class Reject {
    static readonly type = '[Technical Proposals Customer] Reject';
    constructor(public requestId: Uuid, public technicalProposalId: Uuid, public proposalPositions: TechnicalProposalPosition[], public comment: string) {}
  }

  // Отправить позицию ТП на доработку
  export class SendToEdit {
    static readonly type = '[Technical Proposals Customer] SendToEdit';
    constructor(public requestId: Uuid, public technicalProposalId: Uuid, public proposalPositions: TechnicalProposalPosition[], public comment: string) {}
  }
}
