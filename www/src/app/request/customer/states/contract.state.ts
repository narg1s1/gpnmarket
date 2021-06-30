import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { StateStatus } from "../../common/models/state-status";
import { Injectable } from "@angular/core";
import { Contract } from "../../common/models/contract";
import { ContractService } from "../services/contract.service";
import { ContractActions } from "../actions/contract.actions";
import { patch, updateItem } from "@ngxs/store/operators";
import { catchError, switchMap, tap } from "rxjs/operators";
import { saveAs } from 'file-saver/src/FileSaver';
import { ToastActions } from "../../../shared/actions/toast.actions";
import { ContractFilter } from "../../common/models/contract-filter";
import Fetch = ContractActions.Fetch;
import Reject = ContractActions.Reject;
import Approve = ContractActions.Approve;
import Upload = ContractActions.Upload;
import Download = ContractActions.Download;
import Filter = ContractActions.Filter;
import FetchAvailibleFilters = ContractActions.FetchAvailibleFilters;
import SignDocument = ContractActions.SignDocument;
import ConfirmWithoutSigning = ContractActions.ConfirmWithoutSigning;

export interface ContractStateStateModel {
  contracts: Contract[];
  availibleFilters?: ContractFilter;
  status: StateStatus;
}

type Model = ContractStateStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'CustomerContract',
  defaults: { contracts: null, availibleFilters: {}, status: "pristine" }
})
@Injectable()
export class ContractState {
  constructor(private rest: ContractService) {}

  @Selector() static status({ status }: Model) { return status; }
  @Selector() static availibleFilters({ availibleFilters }: Model) { return availibleFilters; }
  @Selector() static contractsLength({ contracts }: Model) { return contracts?.length; }

  static contracts(statuses?: Contract['status'][]) {
    return createSelector([ContractState], ({ contracts }: Model) => {
      return contracts.filter(c => !statuses || statuses.includes(c.status));
    });
  }

  @Action([Fetch, Filter])
  fetch({ setState, dispatch }: Context, { requestId, filter }: Fetch & Filter) {
    setState(patch<Model>(!filter ? { status: 'fetching', contracts: null } : { status: 'updating'}));

    return this.rest.list(requestId, filter).pipe(tap(contracts => setState(patch<Model>({ contracts, status: 'received' }))));
  }

  @Action(FetchAvailibleFilters)
  fetchAvailibleFilters({ setState }: Context, { requestId }: FetchAvailibleFilters) {
    return this.rest.availableFilters(requestId).pipe(tap(availibleFilters => setState(patch<Model>({ availibleFilters }))));
  }

  @Action(Reject)
  reject({ setState, dispatch }: Context, { requestId, contract, files, comment }: Reject) {
    setState(patch<Model>({status: "updating"}));
    return dispatch(!!files ? new Upload(contract, files, comment) : []).pipe(
      switchMap(() => this.rest.reject(contract.id)),
      tap(c => setState(patch({ contracts: updateItem(({ id }) => c.id === id, c) }))),
      tap(() => setState(patch<Model>({ status: "received" }))),
      tap(() => dispatch([new FetchAvailibleFilters(requestId), new ToastActions.Success('Договор отправлен на доработку')])),
      catchError(e => {
        setState(patch<Model>({status: "error"}));
        return dispatch(new ToastActions.Error(e?.error?.detail ?? "Неизвестная ошибка"));
      })
    );
  }

  @Action(Approve)
  approve({ setState, dispatch }: Context, { requestId, contract }: Approve) {
    setState(patch<Model>({status: "updating"}));
    return this.rest.approve(contract.id).pipe(
      tap(c => setState(patch<Model>({
        contracts: updateItem(({ id }) => c.id === id, c),
        status: "received"
      }))),
      tap(() => dispatch([new FetchAvailibleFilters(requestId), new ToastActions.Success('Договор согласован')])),
      catchError(e => {
        setState(patch<Model>({status: "error"}));
        return dispatch(new ToastActions.Error(e?.error?.detail ?? "Неизвестная ошибка"));
      })
    );
  }

  @Action(ConfirmWithoutSigning)
  confirmWithoutSigning({ setState, dispatch }: Context, { requestId, contract }: ConfirmWithoutSigning) {
    setState(patch<Model>({status: "updating"}));
    return this.rest.confirmWithoutSigning(contract.id).pipe(
      tap(c => setState(patch<Model>({
        contracts: updateItem(({ id }) => c.id === id, c),
        status: "received"
      }))),
      tap(() => dispatch([new FetchAvailibleFilters(requestId), new ToastActions.Success('Договор рассмотрен')])),
      catchError(e => {
        setState(patch<Model>({status: "error"}));
        return dispatch(new ToastActions.Error(e?.error?.detail ?? "Неизвестная ошибка"));
      })
    );
  }

  @Action(Upload)
  upload({ setState }: Context, { contract, files, comment}: Upload) {
    return this.rest.upload(contract.id, files, comment);
  }

  @Action(Download)
  download({ setState }: Context, { contract }: Download) {
    return this.rest.download(contract.id).pipe(tap(data => saveAs(data, `Договор c ${ contract.supplier.shortName }.docx`)));
  }

  @Action(SignDocument)
  signDocument({ setState, dispatch }: Context, { contractId, data, requestId }: SignDocument) {
    return this.rest.signDocument(contractId, data).pipe(
      tap(c => setState(patch({ contracts: updateItem(({ id }) => c.id === id, c) }))),
      tap(() => dispatch(new FetchAvailibleFilters(requestId))),
      catchError(e => {
        setState(patch<Model>({status: "error"}));
        return dispatch(new ToastActions.Error(e?.error?.detail ?? "Неизвестная ошибка"));
      })
    );
  }
}
