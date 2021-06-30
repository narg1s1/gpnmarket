import { Page } from "../../../core/models/page";
import { StateStatus } from "../../../request/common/models/state-status";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { patch } from "@ngxs/store/operators";
import { tap } from "rxjs/operators";
import { AgreementsService } from "../services/agreements.service";
import { AgreementListActions } from "../actions/agreement-list.actions";
import Fetch = AgreementListActions.Fetch;
import { Agreement } from "../../common/models/Agreement";
import Rate = AgreementListActions.Rate;

export interface AgreementListStateModel {
  agreements: Page<Agreement>;
  statusCounts: number;
  status: StateStatus;
}

type Model = AgreementListStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerAgreementList',
  defaults: { agreements: null, statusCounts: null, status: "pristine" }
})
@Injectable()
export class AgreementListState {
  constructor(private rest: AgreementsService) {}

  @Selector()
  static agreements({ agreements }: Model) { return agreements.entities; }

  @Selector()
  static totalCount({ agreements }: Model) { return agreements.totalCount; }

  @Selector()
  static status({ status }: Model) { return status; }

  @Action(Fetch, { cancelUncompleted: true }) fetch({ setState }: Context, {filters, startFrom, pageSize}: Fetch) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getAgreements(filters, startFrom, pageSize).pipe(
      tap(agreements => setState(patch({ agreements, status: "received" as StateStatus }))),
    );
  }

  @Action(Rate, { cancelUncompleted: true }) rate({ setState, dispatch }: Context, {requestId, positionId, rating}: Rate) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.setRating(requestId, positionId, rating).pipe(
      tap(() => setState(patch({ status: "received" as StateStatus }))),
    );
  }
}
