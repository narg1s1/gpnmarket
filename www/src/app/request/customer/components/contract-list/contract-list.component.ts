import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ContractFilter } from "../../../common/models/contract-filter";
import { ContractStatusLabels } from "../../../common/dictionaries/contract-status-labels";
import { ContractStatus } from "../../../common/enum/contract-status";
import { UxgFilterComponent } from "uxg";
import { UxgFilterCheckboxList } from "uxg";
import { Uuid } from "../../../../cart/models/uuid";
import { searchContragents } from "../../../../shared/helpers/search";
import { RequestDocument } from "../../../common/models/request-document";
import Fetch = ContractActions.Fetch;
import Download = ContractActions.Download;
import Reject = ContractActions.Reject;
import Approve = ContractActions.Approve;
import ConfirmWithoutSigning = ContractActions.ConfirmWithoutSigning;
import Filter = ContractActions.Filter;
import SignDocument = ContractActions.SignDocument;
import FetchAvailibleFilters = ContractActions.FetchAvailibleFilters;

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit, OnDestroy {
  @ViewChild('filterRef') filterRef: UxgFilterComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.status) requestStatus$: Observable<StateStatus>;
  @Select(ContractState.availibleFilters) availibleFilters$: Observable<ContractFilter>;
  @Select(ContractState.contractsLength) contractsLength$: Observable<number>;
  @Select(ContractState.contracts([ContractStatus.ON_APPROVAL, ContractStatus.APPROVED])) contractsSentToReview$: Observable<Contract[]>;
  @Select(ContractState.contracts([ContractStatus.REJECTED])) contractsSendToEdit$: Observable<Contract[]>;
  @Select(ContractState.contracts([ContractStatus.SIGNED, ContractStatus.CONFIRMED_BY_CUSTOMER_WO_SIGN])) contractsReviewed$: Observable<Contract[]>;
  @Select(ContractState.contracts([ContractStatus.SIGNED_BY_CUSTOMER])) contractsPendingSign$: Observable<Contract[]>;
  @Select(ContractState.contracts([ContractStatus.SIGNED_BY_SUPPLIER])) contractsSignedBySupplier$: Observable<Contract[]>;
  @Select(ContractState.status) status$: Observable<StateStatus>;

  contract: Contract;
  contractId: Uuid;
  documentsToSign: RequestDocument[];

  readonly form = this.fb.group({ positionName: "", suppliers: [], statuses: [] });
  readonly certForm: FormGroup = this.fb.group({
    thumbprint: [null, Validators.required]
  });
  readonly destroy$ = new Subject();
  readonly suppliersSearch$ = new BehaviorSubject<string>("");

  readonly contractSuppliersItems$: Observable<UxgFilterCheckboxList<Uuid>> = combineLatest([this.suppliersSearch$, this.availibleFilters$]).pipe(
    map(([q, f]) => searchContragents(q, f?.suppliers ?? []).map((c) => ({ label: c.shortName, value: c.id })))
  );
  readonly contractStatusesItems$: Observable<UxgFilterCheckboxList<ContractStatus>> = this.availibleFilters$.pipe(
    map(({ statuses }) => statuses?.map(value => ({ label: ContractStatusLabels[value], value }))),
  );
  readonly download = (contract: Contract) => new Download(contract);
  readonly reject = (request: Request, contract: Contract, files: File[], comment?: string) => new Reject(request.id, contract, files, comment);
  readonly approve = (request: Request, contract: Contract) => new Approve(request.id, contract);
  readonly confirmWithoutSigning = (request: Request, contract: Contract) => new ConfirmWithoutSigning(request.id, contract);
  readonly signDocument = (contractId, data) => new SignDocument(contractId, data.data, data.requestId);
  readonly filter = (request: Request, value: ContractFilter<Uuid>) => new Filter(request.id, value);

  constructor(
    public store: Store,
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({ id }) => this.store.dispatch([new Fetch(id), new FetchAvailibleFilters(id)])),
      delayWhen(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
      withLatestFrom(this.request$),
      tap(([, { id, number }]) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${number}`, link: `/requests/customer/${id}` },
        { label: 'Согласование договора', link: `/requests/customer/${id}/contracts`},
      ]),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabActivated(_id) {
    this.cdr.detectChanges();
  }
}
