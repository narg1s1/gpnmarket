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
import FetchProcedureCreationPositions = RequestActions.FetchProcedureCreationPositions;
import RefreshProcedureCreationPositions = RequestActions.RefreshProcedureCreationPositions;
import RefreshPositions = RequestActions.RefreshPositions;
import FetchAvailableFilters = RequestActions.FetchAvailableFilters;
import Refresh = RequestActions.Refresh;
import AttachDocuments = RequestActions.AttachDocuments;
import UploadFromTemplate = RequestActions.UploadFromTemplate;
import { ToastActions } from "../../../shared/actions/toast.actions";
import EditRequestName = RequestActions.EditRequestName;
import ChangeResponsibleUser = RequestActions.ChangeResponsibleUser;
import ChangeResponsibleUserPositions = RequestActions.ChangeResponsibleUserPositions;
import { RequestAvailableFilters } from "../../common/models/request-available-filters";
import { RequestGroup } from "../../common/models/request-group";
import FetchGroups = RequestActions.FetchGroups;

export interface RequestStateStateModel {
  request: Request;
  positions: RequestPositionList[];
  procedureCreationPositions: RequestPositionList[];
  groups: RequestGroup[];
  status: StateStatus;
  positionsStatus: StateStatus;
  availableFilters: RequestAvailableFilters;
  totalCount: number;
  totalCountWithoutNotRelevantAndCanceled: number;
  isWithoutStartPrice: boolean;
}

type Model = RequestStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'BackofficeRequest',
  defaults: {
    request: null,
    positions: null,
    procedureCreationPositions: null,
    groups: null,
    status: "pristine",
    positionsStatus: "pristine",
    availableFilters: null,
    totalCount: null,
    totalCountWithoutNotRelevantAndCanceled: null,
    isWithoutStartPrice: null,
  }
})
@Injectable()
export class RequestState {
  constructor(private rest: RequestService) {}

  @Selector() static request({request}: Model) { return request; }
  @Selector() static positions({positions}: Model) { return positions; }
  @Selector() static procedureCreationPositions({procedureCreationPositions}: Model) { return procedureCreationPositions; }
  @Selector() static status({status}: Model) { return status; }
  @Selector() static positionsStatus({positionsStatus}: Model) { return positionsStatus; }
  @Selector() static availableFilters({availableFilters}: Model) { return availableFilters; }
  @Selector() static totalCount({totalCount}: Model) { return totalCount; }
  @Selector() static totalCountWithoutNotRelevantAndCanceled({totalCountWithoutNotRelevantAndCanceled}: Model) { return totalCountWithoutNotRelevantAndCanceled; }
  @Selector() static isWithoutStartPrice({isWithoutStartPrice}: Model) { return isWithoutStartPrice; }
  @Selector() static groups({groups}: Model) { return groups; }

  @Action(Fetch) fetch({setState}: Context, {requestId, clearState}: Fetch) {
    if (clearState) {
      setState(patch({ request: null, status: "fetching" as StateStatus }));
    }

    return this.rest.getRequest(requestId).pipe(
      tap(request => setState(patch({request, status: "received" as StateStatus}))),
    );
  }

  @Action(FetchGroups) fetchGroups({ setState }: Context, { requestId }: FetchGroups) {
    return this.rest.getGroups(requestId).pipe(tap(groups => setState(patch({ groups }))));
  }

  @Action(Refresh) refresh({setState, dispatch}: Context, {requestId}: Refresh) {
    setState(patch({ status: "updating" as StateStatus }));
    return dispatch(new Fetch(requestId, false));
  }

  @Action(FetchPositions) fetchPositions({setState}: Context, {requestId, filters, page, pageSize, clearState}: FetchPositions) {
    if (clearState) {
      setState(patch({ positions: null, positionsStatus: "fetching" as StateStatus }));
    }

    return this.rest.getRequestPositions(requestId, (page - 1) * pageSize, pageSize, filters).pipe(
      tap(({ totalCount, totalCountWithoutNotRelevantAndCanceled, isWithoutStartPrice, entities: positions }) =>
        setState(patch<Model>({ positions, totalCount, totalCountWithoutNotRelevantAndCanceled, isWithoutStartPrice, positionsStatus: "received" }))),
    );
  }

  @Action(FetchProcedureCreationPositions) fetchProcedureCreationPositions({setState}: Context, {requestId, filters, page, pageSize, clearState}: FetchPositions) {
    if (clearState) {
      setState(patch({ procedureCreationPositions: null }));
    }

    return this.rest.getRequestPositions(requestId, (page - 1) * pageSize, pageSize, filters).pipe(
      tap(({ entities: procedureCreationPositions }) => setState(patch<Model>({ procedureCreationPositions }))),
    );
  }

  @Action(FetchAvailableFilters) fetchAvailableFilters({setState}: Context, {requestId, filters}) {
    return this.rest.requestAvailableFilters(requestId, filters).pipe(tap(availableFilters => setState(patch({availableFilters: availableFilters}))));
  }

  @Action(RefreshPositions) refreshPositions({setState, dispatch}: Context, {requestId, filters, pageSize, page}: RefreshPositions) {
    setState(patch({ positionsStatus: "updating" as StateStatus }));
    return dispatch(new FetchPositions(requestId, page, pageSize, filters, false));
  }

  @Action(RefreshProcedureCreationPositions) refreshProcedureCreationPositions({setState, dispatch}: Context, {requestId, filters, pageSize, page}: RefreshPositions) {
    setState(patch({ positionsStatus: "updating" as StateStatus }));
    return dispatch(new FetchProcedureCreationPositions(requestId, page, pageSize, filters, false));
  }

  @Action(Publish) publish({setState, dispatch}: Context, {requestId, positions, refresh}: Publish) {
    return this.rest.publishRequest(requestId, positions).pipe(
      switchMap(() => dispatch(refresh ? [new Refresh(requestId)] : []))
    );
  }

  @Action(ChangeResponsibleUser)
  changeResponsibleUser({ setState, dispatch }: Context, { requestId, userId }: ChangeResponsibleUser) {
    return this.rest.changeResponsibleUser(requestId, userId).pipe(switchMap(() => dispatch([new Refresh(requestId)])));
  }

  @Action(ChangeResponsibleUserPositions)
  changeResponsibleUserPositions({ setState, dispatch }: Context, { requestId, userId, positionIds, useAllPositions, filters }: ChangeResponsibleUserPositions) {
    return this.rest.changeResponsibleUserPositions(requestId, userId, positionIds, useAllPositions, filters).pipe(
      switchMap(() => dispatch(new Refresh(requestId)))
    );
  }

  @Action(AttachDocuments) attachDocuments({setState, dispatch}: Context, {requestId, positionIds, files, useAllPositions, activeFilters}: AttachDocuments) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.attachDocuments(requestId, positionIds, files, useAllPositions, activeFilters).pipe(
      tap(() => setState(patch({ status: "received" as StateStatus})))
    );
  }

  @Action(EditRequestName) editRequestName({setState, dispatch}: Context, {requestId, requestName}: EditRequestName) {
    setState(patch({ status: "updating" as StateStatus }));
    return this.rest.editRequestName(requestId, requestName).pipe(
      switchMap(() => dispatch([new Refresh(requestId)])),
    );
  }

  @Action(UploadFromTemplate) uploadFromTemplate({ dispatch }: Context, { requestId, files, isDisableRefresh }: UploadFromTemplate) {
    return this.rest.addPositionsFromExcel(requestId, files).pipe(
      catchError(e => dispatch(new ToastActions.Error('Ошибка в шаблоне ' + (e && e.error && e.error.detail || "")))),
      isDisableRefresh
      ? tap(() => {})
      : switchMap(() => dispatch(new Refresh(requestId)))
    );
  }
}
