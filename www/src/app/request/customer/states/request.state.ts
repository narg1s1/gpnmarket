import { Action, Selector, State, StateContext } from "@ngxs/store";
import { StateStatus } from "../../common/models/state-status";
import { Injectable } from "@angular/core";
import { Request } from "../../common/models/request";
import { RequestActions } from "../actions/request.actions";
import { RequestService } from "../services/request.service";
import { catchError, switchMap, tap } from "rxjs/operators";
import { patch } from "@ngxs/store/operators";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPositionList } from "../../common/models/request-position-list";
import Fetch = RequestActions.Fetch;
import Publish = RequestActions.Publish;
import FetchPositions = RequestActions.FetchPositions;
import RefreshPositions = RequestActions.RefreshPositions;
import Refresh = RequestActions.Refresh;
import UploadFromTemplate = RequestActions.UploadFromTemplate;
import { ToastActions } from "../../../shared/actions/toast.actions";
import Approve = RequestActions.Approve;
import Reject = RequestActions.Reject;
import PublishPositions = RequestActions.PublishPositions;
import ApprovePositions = RequestActions.ApprovePositions;
import RejectPositions = RequestActions.RejectPositions;
import CreateTemplate = RequestActions.CreateTemplate;
import AttachDocuments = RequestActions.AttachDocuments;
import EditRequestName = RequestActions.EditRequestName;

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
  name: 'CustomerRequest',
  defaults: { request: null, positions: null, status: "pristine", positionsStatus: "pristine", totalCount: null, totalCountWithoutNotRelevantAndCanceled: null }
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
      setState(patch({ request: null, status: "fetching" as StateStatus }));
    }

    return this.rest.getRequest(requestId).pipe(
      tap(request => setState(patch({request, status: "received" as StateStatus}))),
    );
  }

  @Action(Refresh) refresh({setState, dispatch}: Context, {requestId}: Refresh) {
    setState(patch({ status: "updating" as StateStatus }));
    return dispatch(new Fetch(requestId, false));
  }

  @Action(FetchPositions) fetchPositions({setState}: Context, {requestId, page, pageSize, clearState, }: FetchPositions) {
    if (clearState) {
      setState(patch({ positions: null, positionsStatus: "fetching" as StateStatus }));
    }

    return this.rest.getRequestPositions(requestId, (page - 1) * pageSize, pageSize).pipe(
      tap(({ totalCount, totalCountWithoutNotRelevantAndCanceled, entities: positions }) => setState(patch<Model>({ positions, totalCountWithoutNotRelevantAndCanceled, totalCount, positionsStatus: "received" }))),
    );
  }

  @Action(RefreshPositions) refreshPositions({setState, dispatch}: Context, {requestId, pageSize, page }: RefreshPositions) {
    setState(patch({ positionsStatus: "updating" as StateStatus }));
    return dispatch(new FetchPositions(requestId, page, pageSize, false));
  }

  @Action(Publish) publish({setState, dispatch}: Context, {requestId, refresh}: Publish) {
    return this.rest.publishRequest(requestId).pipe(switchMap(() => dispatch(refresh ? new Refresh(requestId) : [])));
  }

  @Action(Approve) approve({setState, dispatch}: Context, {requestId}: Approve) {
    return this.rest.approveRequest(requestId).pipe(switchMap(() => dispatch(new Refresh(requestId))));
  }

  @Action(Reject) reject({setState, dispatch}: Context, {requestId}: Reject) {
    return this.rest.rejectRequest(requestId, "").pipe(switchMap(() => dispatch( new Refresh(requestId))));
  }

  @Action(PublishPositions) publishPositions({setState, dispatch}: Context, {requestId, positionIds, useAllPositions}: PublishPositions) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.publishPositions(requestId, positionIds, useAllPositions).pipe(switchMap(() => dispatch(new Refresh(requestId))));
  }

  @Action(ApprovePositions) approvePositions({setState, dispatch}: Context, {requestId, positionIds}: ApprovePositions) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.approvePositions(requestId, positionIds).pipe(switchMap(() => dispatch(new Refresh(requestId))));
  }

  @Action(RejectPositions) rejectPositions({setState, dispatch}: Context, {requestId, positionIds, rejectionMessage}: RejectPositions) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.rejectPositions(requestId, positionIds, rejectionMessage).pipe(switchMap(() => dispatch(new Refresh(requestId))));
  }

  @Action(AttachDocuments) attachDocuments({setState, dispatch}: Context, {requestId, positionIds, files, useAllPositions}: AttachDocuments) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.attachDocuments(requestId, positionIds, files, useAllPositions).pipe(
      tap(() => setState(patch({ status: "received" as StateStatus})))
    );
  }

  @Action(EditRequestName) editRequestName({setState, dispatch}: Context, {requestId, requestName}: EditRequestName) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.editRequestName(requestId, requestName).pipe(
      switchMap(() => dispatch([new Refresh(requestId)])),
    );
  }

  @Action(UploadFromTemplate) uploadFromTemplate({ dispatch }: Context, {requestId, files}: UploadFromTemplate) {
    return this.rest.addPositionsFromExcel(requestId, files).pipe(
      catchError(e => dispatch(new ToastActions.Error('Ошибка в шаблоне ' + (e && e.error && e.error.detail || "")))),
      switchMap(() => dispatch(new Refresh(requestId)))
    );
  }

  @Action(CreateTemplate) createTemplate({setState, dispatch}: Context, {requestId, positions, title, tag}: CreateTemplate) {
    return this.rest.createTemplate(requestId,  positions, title, tag);
  }
}
