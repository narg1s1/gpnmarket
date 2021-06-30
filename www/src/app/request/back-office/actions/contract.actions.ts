import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { Contract } from "../../common/models/contract";
import { ContractFilter } from "../../common/models/contract-filter";
import { Request } from "../../common/models/request";

export namespace ContractActions {
  // Получить список
  export class Fetch {
    static readonly type = '[Contract Backoffice] Fetch';

    constructor(public requestId: Uuid) {}
  }

  // Отфильтровать список
  export class Filter {
    static readonly type = '[Contract Backoffice] Filter';

    constructor(public requestId: Uuid, public filter: ContractFilter<Uuid>) {}
  }

  export class FetchAvailibleFilters {
    static readonly type = '[Contract Backoffice] FetchAvailibleFilters';
    constructor(public requestId: Uuid) {}
  }

  // Получение доступных контрагентов со списком позиций
  export class FetchSuppliers {
    static readonly type = '[Contract Backoffice] FetchSuppliers';

    constructor(public requestId: Uuid, public search?: string) {}
  }

  // Добавить договор
  export class Create {
    static readonly type = '[Contract Backoffice] Create';

    constructor(public requestId: Uuid, public contragentId: Uuid, public positions: RequestPosition[], public useAllPositions?: boolean) {}
  }

  // Отправить на согласование
  export class Send {
    static readonly type = '[Contract Backoffice] Send';

    constructor(public requestId: Uuid, public contract: Contract, public files?: File[], public comment?: string) {}
  }

  // Подписать
  export class Sign {
    static readonly type = '[Contract Backoffice] Sign';

    constructor(public requestId: Uuid, public contract: Contract) {}
  }

  // Откатить
  export class Rollback {
    static readonly type = '[Contract Backoffice] Rollback';

    constructor(public requestId: Uuid, public contract: Contract) {}
  }

  // Удалить
  export class Delete {
    static readonly type = '[Contract Backoffice] Delete';

    constructor(public requestId: Uuid, public contract: Contract) {}
  }

  // Прикрепить файл договора
  export class Upload {
    static readonly type = '[Contract Backoffice] Upload';
    constructor(public contract: Contract, public files: File[], public comment?: string) {}
  }

  // Скачать типовой договор
  export class Download {
    static readonly type = '[Contract Backoffice] Download';
    constructor(public contract: Contract) {}
  }
}
