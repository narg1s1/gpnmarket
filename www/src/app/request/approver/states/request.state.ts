import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../common/models/state-status";
import { Request } from "../../common/models/request";
import { RequestPositionList } from "../../common/models/request-position-list";
import { RequestService } from "../../customer/services/request.service";
import { patch } from "@ngxs/store/operators";
import { switchMap, tap } from "rxjs/operators";
import { RequestActions } from "../actions/request.actions";
import Fetch = RequestActions.Fetch;
import Refresh = RequestActions.Refresh;
import FetchPositions = RequestActions.FetchPositions;
import RefreshPositions = RequestActions.RefreshPositions;
import ApprovePositions = RequestActions.ApprovePositions;
import RejectPositions = RequestActions.RejectPositions;
import AttachDocuments = RequestActions.AttachDocuments;

export interface RequestStateStateModel {
  request: Request;
  positions: RequestPositionList[];
  status: StateStatus;
  positionsStatus: StateStatus;
  totalCount: number;
  totalCountWithoutNotRelevantAndCanceled: number;
}

type Model = RequestStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'ApproverRequest',
  defaults: {
    request: null,
    positions: null,
    status: "pristine",
    positionsStatus: "pristine",
    totalCount: null,
    totalCountWithoutNotRelevantAndCanceled: null
  }
})
@Injectable()
export class RequestState {

  constructor(private rest: RequestService) {}

  @Selector() static request({request}: Model) { return request; }
  @Selector() static positions({positions}: Model) { return positions; }
  @Selector() static status({status}: Model) { return status; }
  @Selector() static positionsStatus({positionsStatus}: Model) { return positionsStatus; }
  @Selector() static totalCount({totalCount}: Model) { return totalCount; }
  @Selector() static totalCountWithoutNotRelevantAndCanceled({totalCountWithoutNotRelevantAndCanceled}: Model) { return totalCountWithoutNotRelevantAndCanceled; }

  @Action(Fetch) fetch({setState}: Context, {requestId, clearState}: Fetch) {
    if (clearState) {
      setState(patch({request: null, status: "fetching" as StateStatus}));
    }

    return this.rest.getRequest(requestId).pipe(
      tap(request => setState(patch({request, status: "received" as StateStatus}))),
    );
  }

  @Action(Refresh) refresh({setState, dispatch}: Context, {requestId}: Refresh) {
    setState(patch({status: "updating" as StateStatus}));
    return dispatch(new Fetch(requestId, false));
  }

  @Action(FetchPositions) fetchPositions({setState}: Context, {requestId, page, pageSize, filter, clearState}: FetchPositions) {
    if (clearState) {
      setState(patch({positions: null, positionsStatus: "fetching" as StateStatus}));
    }

    return this.rest.getRequestPositions(requestId, (page - 1) * pageSize, pageSize, filter).pipe(
      tap(({ totalCount, totalCountWithoutNotRelevantAndCanceled, entities: positions }) => setState(patch<Model>({ positions, totalCount, totalCountWithoutNotRelevantAndCanceled, positionsStatus: "received" }))),
    );
  }

  @Action(RefreshPositions) refreshPositions({setState, dispatch}: Context, {requestId, page, pageSize, filter}: RefreshPositions) {
    setState(patch({positionsStatus: "updating" as StateStatus}));
    return dispatch(new FetchPositions(requestId, page, pageSize, filter, false));
  }

  @Action(ApprovePositions) approvePositions({setState, dispatch}: Context, {requestId, positionIds}: ApprovePositions) {
    setState(patch({status: "updating" as StateStatus}));
    return this.rest.approvePositions(requestId, positionIds).pipe(
      switchMap(() => dispatch([new Refresh(requestId), new RefreshPositions(requestId, 0, 10)]))
    );
  }

  @Action(RejectPositions) rejectPositions({setState, dispatch}: Context, {requestId, positionIds, rejectionMessage}: RejectPositions) {
    setState(patch({status: "updating" as StateStatus}));
    return this.rest.rejectPositions(requestId, positionIds, rejectionMessage).pipe(
      switchMap(() => dispatch([new Refresh(requestId), new RefreshPositions(requestId, 0, 10)]))
    );
  }

  @Action(AttachDocuments) attachDocuments({setState, dispatch}: Context, {requestId, positionIds, files, useAllPositions}: AttachDocuments) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.attachDocuments(requestId, positionIds, files, useAllPositions).pipe(
      tap(() => setState(patch({ status: "received" as StateStatus})))
    );
  }
}
