export namespace AgreementListActions {
  export class Fetch {
    static readonly type = '[Agreement Backoffice] Fetch';
    constructor(public filters: {actions: string[]}, public startFrom?: number, public pageSize?: number) {}
  }
}
