import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import { AgreementListState } from "../../states/agreement-list.state";
import { AgreementListActions } from "../../actions/agreement-list.actions";
import { map, startWith, takeUntil, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { Agreement } from "../../../common/models/Agreement";
import { AgreementAction } from "../../../back-office/enum/agreement-action";
import { AgreementActionFilters } from "../../dictionaries/agreement-action-label";
import { AgreementsListFilter } from "../../../common/models/agreements-list/agreements-list-filter";
import moment from "moment";
import Fetch = AgreementListActions.Fetch;
import Rate = AgreementListActions.Rate;
import { Uuid } from "../../../../cart/models/uuid";

@Component({
  templateUrl: './agreements.component.html',
  styleUrls: ['./agreements.component.scss']
})
export class AgreementsComponent implements OnInit, OnDestroy {
  @Select(AgreementListState.agreements) agreements$: Observable<Agreement[]>;
  @Select(AgreementListState.status) status$: Observable<StateStatus>;
  @Select(AgreementListState.totalCount) totalCount$: Observable<number>;

  pages$: Observable<number>;
  readonly pageSize = 10;
  readonly actions: { type: AgreementAction[], label: string }[] = AgreementActionFilters;
  readonly form = this.fb.group({ actions: null, numberOrName: '', issuedDateFrom: null, issuedDateTo: null, contragents: [[]] });
  readonly destroy$ = new Subject();
  readonly filter$ = new Subject<AgreementsListFilter>();
  readonly refresh$ = new BehaviorSubject('');

  constructor(
    private fb: FormBuilder,
    public store: Store,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.pages$ = this.route.queryParams.pipe(map(params => +params["page"]));

    combineLatest([
      this.filter$.pipe(
        tap(() => this.router.navigate(["."], { relativeTo: this.route, queryParams: null })),
        startWith<AgreementsListFilter>({}),
      ),
      this.pages$,
      this.refresh$
    ]).pipe(takeUntil(this.destroy$)).subscribe(([filters, page]) => {
      this.store.dispatch(new Fetch({
          ...filters,
          issuedDateFrom: filters.issuedDateFrom ? moment(filters.issuedDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD') : null,
          issuedDateTo: filters.issuedDateTo ? moment(filters.issuedDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD') : null
        },
        (page ? page - 1 : 0) * this.pageSize,
        this.pageSize
      ));
    });
  }

  sendRating(requestId: Uuid, positionId: Uuid, rating: number) {
    this.store.dispatch(new Rate(requestId, positionId, rating)).subscribe(
      () => this.refresh$.next('')
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
