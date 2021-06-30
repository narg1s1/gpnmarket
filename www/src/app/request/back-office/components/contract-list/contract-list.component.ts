import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { RequestState } from "../../states/request.state";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { Request } from "../../../common/models/request";
import { StateStatus } from "../../../common/models/state-status";
import { ContractState } from "../../states/contract.state";
import { delayWhen, map, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { ContractActions } from "../../actions/contract.actions";
import { ActivatedRoute } from "@angular/router";
import { RequestActions } from "../../actions/request.actions";
import { UxgBreadcrumbsService } from "uxg";
import { Contract } from "../../../common/models/contract";
import { FormBuilder } from "@angular/forms";
import { ContractFilter } from "../../../common/models/contract-filter";
import { ContractStatusLabels } from "../../../common/dictionaries/contract-status-labels";
import { ContragentWithPositions } from "../../../common/models/contragentWithPositions";
import { Uuid } from "../../../../cart/models/uuid";
import { UxgFilterCheckboxList } from "uxg";
import { ContractStatus } from "../../../common/enum/contract-status";
import { searchContragents } from "../../../../shared/helpers/search";
import FetchSuppliers = ContractActions.FetchSuppliers;
import Fetch = ContractActions.Fetch;
import Send = ContractActions.Send;
import Rollback = ContractActions.Rollback;
import Download = ContractActions.Download;
import Sign = ContractActions.Sign;
import Delete = ContractActions.Delete;
import Filter = ContractActions.Filter;
import FetchAvailibleFilters = ContractActions.FetchAvailibleFilters;
import { FeatureService } from "../../../../core/services/feature.service";

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit, OnDestroy {
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.status) requestStatus$: Observable<StateStatus>;
  @Select(ContractState.suppliers) suppliers$: Observable<ContragentWithPositions[]>;
  @Select(ContractState.contracts) contracts$: Observable<Contract[]>;
  @Select(ContractState.status) status$: Observable<StateStatus>;
  @Select(ContractState.availibleFilters) availibleFilters$: Observable<ContractFilter>;

  deleteContract: Contract;
  rollbackContract: Contract;

  readonly form = this.fb.group({ positionName: "", suppliers: [], statuses: [] });
  readonly destroy$ = new Subject();
  readonly suppliersSearch$ = new BehaviorSubject<string>("");
  readonly contractSuppliersItems$: Observable<UxgFilterCheckboxList<Uuid>> = combineLatest([this.suppliersSearch$, this.availibleFilters$]).pipe(
    map(([q, f]) => searchContragents(q, f?.suppliers ?? []).map((c) => ({ label: c.shortName, value: c.id })))
  );
  readonly contractStatusesItems$: Observable<UxgFilterCheckboxList<ContractStatus>> = this.availibleFilters$.pipe(
    map(({ statuses }) => statuses?.map(value => ({ label: ContractStatusLabels[value], value }))),
  );
  readonly send = (request: Request, contract: Contract, files?: File[], comment?: string) => new Send(request.id, contract, files, comment);
  readonly sign = (request: Request, contract: Contract) => new Sign(request.id, contract);
  readonly rollback = (request: Request, contract: Contract) => new Rollback(request.id, contract);
  readonly download = (contract: Contract) => new Download(contract);
  readonly delete = (request: Request, contract: Contract) => new Delete(request.id, contract);
  readonly filter = (request: Request, value: ContractFilter<Uuid>) => new Filter(request.id, value);
  readonly fetchSuppliers = (request: Request, search: string) => new FetchSuppliers(request.id, search);

  constructor(
    public store: Store,
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public featureService: FeatureService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({ id }) => this.store.dispatch([new Fetch(id), new FetchAvailibleFilters(id), new FetchSuppliers(id)])),
      delayWhen(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([p, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/backoffice" },
        { label: `Заявка №${ number }`, link: `/requests/backoffice/${ id }` },
        { label: 'Согласование договора', link: `/requests/backoffice/${ id }/contracts` },
      ]),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
