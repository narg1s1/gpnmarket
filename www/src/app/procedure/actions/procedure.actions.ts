import { IProposalsFilters } from './../models/proposals-filters';
import {Uuid} from "../../cart/models/uuid";
import {
  CommonProposal,
  CommonProposalByPosition,
  CommonProposalItem
} from "../../request/common/models/common-proposal";


export namespace ProcedureActions {
  export class FetchProcedure {
    static readonly type = '[Procedure Backoffice] FetchProcedure';
    constructor(public procedureUid: Uuid, public clearState = true) {
    }
  }

  export class FetchProposals {
    static readonly type = '[Procedure Backoffice] FetchProposals';
    constructor(public groupId: Uuid, public clearState = true, public filters: IProposalsFilters = null) {
    }
  }

  export class FetchProposalGroup {
    static readonly type = '[Procedure Backoffice] FetchProposalGroup';
    constructor(public procedureId: Uuid, public proposalGroupId: Uuid, public clearState = true, public filters: IProposalsFilters = null) {
    }
  }

  export class FetchProposalAvailableFilters {
    static readonly type = '[Procedure Backoffice] Fetch Proposal Available Filters';
    constructor(public tcpGroupId: Uuid, public offersApproveGroupId?: Uuid) {}
  }

  export class FetchOffersApproveGroups {
    static readonly type = '[Procedure Backoffice] Fetch offers approve groups';
    constructor(public tcpGroupId: Uuid, public procedureId?: Uuid, public filters: IProposalsFilters = null) {}
  }

  // Скачать шаблон
  export class DownloadTemplate {
    static readonly type = '[Procedure Backoffice] DownloadTemplate';

    constructor(public groupId?: Uuid) {}
  }

  // Создать из шаблона
  export class UploadTemplate {
    static readonly type = '[Procedure Backoffice] UploadTemplate';

    constructor(public files: File[], public groupId: Uuid, public groupName?: string) {}
  }

  // Создать
  export class CreateProposal {
    static readonly type = '[Procedure Backoffice] Create proposal';

    constructor(
      public groupId: Uuid,
      public payload: Partial<CommonProposal>,
      public items?: Partial<CommonProposalItem>[]
    ) {}
  }

  // Редактировать
  export class UpdateProposal {
    static readonly type = '[Procedure Backoffice] Update proposal';

    constructor(public groupId: Uuid, public payload: Partial<CommonProposal> & { id: Uuid }, public items?: Partial<CommonProposalItem>[]) {}
  }

  // Изменить позиции
  export class UpdateItems {
    static readonly type = '[Procedure Backoffice] Update proposal items';
    update = true;

    constructor(public proposalId: Uuid, public payload: (Partial<CommonProposalItem>)[]) {}
  }

  // Отправить на согласование по позиции
  export class Publish {
    static readonly type = '[Procedure Backoffice] Publish';

    constructor(public groupId: Uuid, public proposals: CommonProposalItem[], public filters: IProposalsFilters = null) {}
  }
}
