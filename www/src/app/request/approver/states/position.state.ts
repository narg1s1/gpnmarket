import { State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../common/models/state-status";

export interface PositionStateStateModel {
  status: StateStatus;
}

type Model = PositionStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'ApproverPosition',
  defaults: { status: "pristine" }
})
@Injectable()
export class PositionState {
}
