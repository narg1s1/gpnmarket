import { IProcedureRequestFromSupplier } from './../../common/models/requests-list/request-from-supplier';
import { Uuid } from 'src/app/cart/models/uuid';

export namespace RequestFromSuppliersActions {

  export class Fetch {
    static readonly type = '[Procedure Requests From Suppliers Backoffice] Fetch';
    constructor(public startFrom = 1, public pageSize = 5, public filters = {}) {}
  }

  export class SendAnswer {
    static readonly type = '[Procedure Requests From Suppliers Backoffice] Send answer with documents';
    constructor(public id: Uuid, public answer: string, public answerDocuments: File[]) {}
  }

  export class AttachDocuments {
    static readonly type = '[Procedure Requests From Suppliers Backoffice] Attach documents';
    constructor(public request: IProcedureRequestFromSupplier, public documents: File[]) {}
  }
}
