export namespace ItemsDictionaryActions {
  export class Search {
    static readonly type = '[KimCustomerItemsDictionary] Search';
    constructor(public query: string) {}
  }

  export class Clear {
    static readonly type = '[KimCustomerItemsDictionary] Clear';
  }
}
