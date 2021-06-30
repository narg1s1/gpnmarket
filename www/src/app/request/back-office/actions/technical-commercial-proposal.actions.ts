import { RequestFilters } from './../../common/models/request-filters';
import { Uuid } from "../../../cart/models/uuid";
import { CommonProposal, CommonProposalByPosition, CommonProposalItem } from "../../common/models/common-proposal";

export namespace TechnicalCommercialProposals {
  export class Fetch {
    static readonly type = '[Technical Commercial Proposals Backoffice] Fetch';

    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }

  // Получить доступные к добавлению позиции
  export class FetchAvailablePositions {
    static readonly type = '[Technical Commercial Proposals Backoffice] FetchAvailablePositions';

    constructor(
      public requestId: Uuid,
      public groupId?: Uuid,
      public positionNameOrNumber?: string,
      public payload?: RequestFilters
    ) {}
  }

  // Получить доступные к созданию процедуры позиции
  export class FetchProcedureCreationPositions {
    static readonly type = '[Technical Commercial Proposals Backoffice] FetchProcedureCreationPositions';

    constructor(public requestId: Uuid, public groupId?: Uuid, public search?: string, public payload?: RequestFilters) {}
  }

  // Получить доступные к созданию процедуры документы всех позиций
  export class FetchAvailableRequestPositionsDocuments {
    static readonly type = '[Technical Commercial Proposals Backoffice] FetchAvailableRequestPositionsDocuments';

    constructor(public requestId: Uuid, public groupId?: Uuid, public payload?: RequestFilters) {}
  }

  // Получить процедуры
  export class FetchProcedures {
    static readonly type = '[Technical Commercial Proposals Backoffice] FetchProcedures';
    update = false;

    constructor(public requestId: Uuid, public groupId?: Uuid) {}
  }


  // Обновить процедуры
  export class RefreshProcedures implements FetchProcedures {
    static readonly type = '[Technical Commercial Proposals Backoffice] RefreshProcedures';
    update = true;

    constructor(public requestId: Uuid, public groupId?: Uuid) {}
  }

  // Создать
  export class Create {
    static readonly type = '[Technical Commercial Proposals Backoffice] Create';

    constructor(
      public requestId: Uuid,
      public groupId: Uuid,
      public payload: Partial<CommonProposal>,
      public items?: Partial<CommonProposalItem>[]
    ) {}
  }

  // Редактировать
  export class Update {
    static readonly type = '[Technical Commercial Proposals Backoffice] Update';

    constructor(public requestId: Uuid, public groupId: Uuid, public payload: Partial<CommonProposal> & { id: Uuid }, public items?: Partial<CommonProposalItem>[]) {}}

  // Отправить на согласование по позиции
  export class Publish {
    static readonly type = '[Technical Commercial Proposals Backoffice] Publish';

    constructor(public requestId: Uuid, public groupId: Uuid, public proposalsByPositions: CommonProposalByPosition[]) {}
  }

  // Создать из шаблона
  export class UploadTemplate {
    static readonly type = '[Technical Commercial Proposals Backoffice] UploadTemplate';

    constructor(public requestId: Uuid, public files: File[], public groupId: Uuid, public groupName?: string) {}
  }

  // Скачать шаблон
  export class DownloadTemplate {
    static readonly type = '[Technical Commercial Proposals Backoffice] DownloadTemplate';

    constructor(public requestId: Uuid, public groupId?: Uuid) {}
  }

  // Скачать аналитическую справку
  export class DownloadAnalyticalReport {
    static readonly type = '[Technical Commercial Proposals Backoffice] DownloadAnalyticalReport';

    constructor(public requestId: Uuid, public groupId: Uuid) {}
  }

  // Изменить позиции
  export class UpdateItems {
    static readonly type = '[Technical Commercial Proposals Backoffice] UpdateItems';
    update = true;

    constructor(public proposalId: Uuid, public payload: (Partial<CommonProposalItem>)[]) {}
  }

  // Откатить
  export class Rollback {
    static readonly type = '[Technical Commercial Proposals Backoffice] Rollback';

    constructor(public requestId: Uuid, public groupId: Uuid, public positionId: Uuid) {}
  }
}
