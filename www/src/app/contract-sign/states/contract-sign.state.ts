import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { ContractSignService } from "../services/contract-sign.service";
import { StateStatus } from "../../request/common/models/state-status";
import { tap } from "rxjs/operators";
import { patch } from "@ngxs/store/operators";
import { ContractSignActions } from "../actions/contract-sign.actions";
import Fetch = ContractSignActions.Fetch;
import { Contract } from "../../request/common/models/contract";
import SignDocument = ContractSignActions.SignDocument;

export interface ContractSignStateModel {
  contractInfo: Contract;
  status: StateStatus;
}

type Model = ContractSignStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'ContractSign',
  defaults: { contractInfo: null, status: "pristine" }
})
@Injectable()
export class ContractSignState {
  constructor(private rest: ContractSignService) {}

  @Selector() static contractSignInfo({contractInfo}: Model) { return contractInfo; }
  @Selector() static status({status}: Model) { return status; }

  @Action(Fetch) fetch({setState}: Context, { contractId }: Fetch) {
    setState(patch({ status: "fetching" as StateStatus }));
    return this.rest.getContractSignInfo(contractId).pipe(
      tap(contractInfo => setState(patch({contractInfo, status: "received" as StateStatus}))),
    );
  }

  @Action(SignDocument) signDocument({ setState, dispatch }: Context, { contractId, data }: SignDocument) {
    return this.rest.signDocument(contractId, data).pipe(
      tap(() => dispatch(new Fetch(contractId))),
    );
  }
}
