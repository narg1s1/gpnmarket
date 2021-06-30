import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../../request/common/models/state-status";
import { patch } from "@ngxs/store/operators";
import { tap } from "rxjs/operators";
import { KimPriceOrderService } from "../services/kim-price-order.service";
import { PriceOrderProposalsActions } from "../actions/price-order-proposals.actions";
import Fetch = PriceOrderProposalsActions.Fetch;
import { KimPriceOrder } from "../../common/models/kim-price-order";
import Approve = PriceOrderProposalsActions.Approve;
import ApproveMultiple = PriceOrderProposalsActions.ApproveMultiple;

export class KimCustomerPriceOrderProposalsStateModel {
  priceOrder: KimPriceOrder;
  status: StateStatus;
}

type Model = KimCustomerPriceOrderProposalsStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'KimCustomerPriceOrderProposals',
  defaults: { priceOrder: null, status: "pristine" }
})
@Injectable()
export class PriceOrderProposalsState {

  static positionsWithProposals(hasWinner: boolean = null) {
    return createSelector(
      [PriceOrderProposalsState], ({ priceOrder: { positions } }: Model) => positions.filter(
        ({ proposals: p }) => hasWinner === null || hasWinner ? p.some(({ isWinner: w }) => w) : p.every(({ isWinner: w }) => !w)
      )
    );
  }

  @Selector() static priceOrder({ priceOrder }: Model) { return priceOrder; }
  @Selector() static status({ status }: Model) { return status; }
  @Selector() static proposalsLength({ priceOrder }: Model) {
    return priceOrder.positions.reduce((total, { proposals: p }) => (total += p.length), 0);
  }

  constructor(private rest: KimPriceOrderService) {}

  @Action(Fetch)
  fetch({ setState }: Context, { priceOrderId }: Fetch) {
    setState(patch({ status: "fetching" } as Model));

    return this.rest.proposals(priceOrderId).pipe(
      tap(priceOrder => setState(patch({priceOrder, status: "received"} as Model))),
    );
  }

  @Action(Approve)
  approve({ setState }: Context, { priceOrderId, proposalId}: Approve) {
    setState(patch({ status: "updating" } as Model));

    return this.rest.approve(priceOrderId, proposalId).pipe(
      tap(priceOrder => setState(patch({priceOrder, status: "received"} as Model))),
    );
  }

  @Action(ApproveMultiple)
  approveMultiple({ setState }: Context, { priceOrderId, proposalIds}: ApproveMultiple) {
    setState(patch({ status: "updating" } as Model));

    return this.rest.approveMultiple(priceOrderId, proposalIds).pipe(
      tap(priceOrder => setState(patch({priceOrder, status: "received"} as Model))),
    );
  }
}
