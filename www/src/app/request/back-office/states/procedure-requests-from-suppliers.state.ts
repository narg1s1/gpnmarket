import { IProcedureRequestFromSupplier, RequestFromSupplierStatuses } from './../../common/models/requests-list/request-from-supplier';
import { ProcedureService } from './../services/procedure.service';
import { patch, updateItem } from '@ngxs/store/operators';
import { tap } from 'rxjs/operators';
import { StateContext } from '@ngxs/store';
import { Action } from '@ngxs/store';
import { Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';
import { RequestFromSuppliersActions } from '../actions/requests-from-suppliers.actions';

interface IRequestsFromSuppliersStateModel {
  data: IProcedureRequestFromSupplier[];
  status: string;
}

@State<IRequestsFromSuppliersStateModel>({
  name: 'BackofficeRequestsFromSuppliers',
  defaults: {
    data: null,
    status: "pristine"
  }
})
@Injectable()
export class RequestsFromSuppliersState {
  constructor(private rest: ProcedureService) {}

  @Selector() static requestsFromSuppliers({data}: IRequestsFromSuppliersStateModel) { return data; }
  @Selector() static totalRequestsCount({data}: IRequestsFromSuppliersStateModel) { return data.length; }

  @Action(RequestFromSuppliersActions.Fetch)
  fetch({setState}: StateContext<IRequestsFromSuppliersStateModel>, {startFrom, pageSize, filters}: RequestFromSuppliersActions.Fetch) {
    setState(patch({ status: "fetching" }));

    return this.rest.getRequestsFromSuppliers(startFrom, pageSize, filters).pipe(
      tap(response => {
        setState(patch({ data: response, status: "received" }));
      })
    );
  }

  @Action(RequestFromSuppliersActions.SendAnswer)
  sendAnswer({setState, getState}: StateContext<IRequestsFromSuppliersStateModel>, {id, answer, answerDocuments}: RequestFromSuppliersActions.SendAnswer) {
    return this.rest.sendRequestAnswer(id, answer, answerDocuments).pipe(
      tap(() => {
        const requests = getState().data;
        const newRequest = requests.find((request: IProcedureRequestFromSupplier) => request.id === id);
        newRequest.answer = answer;
        newRequest.status = RequestFromSupplierStatuses.ANSWERED;
        setState(patch({
          data: updateItem<IProcedureRequestFromSupplier>(request => request.id === id, newRequest)
        }));
      })
    );
  }

  @Action(RequestFromSuppliersActions.AttachDocuments)
  attachDocuments({setState, getState}: StateContext<IRequestsFromSuppliersStateModel>, {request, documents}: RequestFromSuppliersActions.AttachDocuments) {
    const requestForReplaceDocs = getState().data?.find((req: IProcedureRequestFromSupplier) => req.id === request.id);

    setState(patch({
      data: updateItem<IProcedureRequestFromSupplier>((req: IProcedureRequestFromSupplier) => req.id === request.id, {
        ...requestForReplaceDocs,
        answerDocuments: documents
      })
    }));
  }
}
