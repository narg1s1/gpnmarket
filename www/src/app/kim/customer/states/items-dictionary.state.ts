import { StateStatus } from "../../../request/common/models/state-status";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { patch } from "@ngxs/store/operators";
import { catchError, tap } from "rxjs/operators";
import { KimDictionaryItem } from "../../common/models/kim-dictionary-item";
import { ItemsDictionaryActions } from "../actions/items-dictionary.actions";
import Search = ItemsDictionaryActions.Search;
import { KimItemsDictionaryService } from "../services/kim-items-dictionary.service";
import Clear = ItemsDictionaryActions.Clear;

export interface KimItemsDictionaryStateModel {
  itemsDictionary: KimDictionaryItem[];
  status: StateStatus;
}

type Model = KimItemsDictionaryStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'ItemsDictionary',
  defaults: { itemsDictionary: null, status: "pristine" }
})
@Injectable()
export class ItemsDictionaryState {
  @Selector() static itemsDictionary({itemsDictionary}: Model) { return itemsDictionary; }
  @Selector() static status({ status }: Model) { return status; }

  constructor(private rest: KimItemsDictionaryService) {}

  @Action(Search)
  search({setState}: Context, {query}: Search) {
    setState(patch({ status: "fetching" as StateStatus }));

    return this.rest.search(query).pipe(
      tap(itemsDictionary => setState(patch({ itemsDictionary, status: "received" as StateStatus } )))
    );
  }

  @Action(Clear)
  clear({setState}: Context) {
    setState(patch({itemsDictionary: null, status: "received" as StateStatus}));
  }
}
