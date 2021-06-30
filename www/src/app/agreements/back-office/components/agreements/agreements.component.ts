import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { AgreementListState } from "../../states/agreement-list.state";
import { Observable, Subject } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import Fetch = AgreementListActions.Fetch;
import { ActivatedRoute, Router } from "@angular/router";
import { map, takeUntil } from "rxjs/operators";
import { AgreementListActions } from "../../actions/agreement-list.actions";
import { Agreement } from "../../../common/models/Agreement";
import { FormControl, FormGroup } from "@angular/forms";
import { AgreementActionFilters } from "../../dictionaries/agreement-action-label";
import { AgreementAction } from "../../enum/agreement-action";

@Component({
  templateUrl: './agreements.component.html',
  styleUrls: ['./agreements.component.scss']
})
export class AgreementsComponent implements OnInit, OnDestroy {
  @Select(AgreementListState.agreements) agreements$: Observable<Agreement[]>;
  @Select(AgreementListState.status) status$: Observable<StateStatus>;
  @Select(AgreementListState.totalCount) totalCount$: Observable<number>;

  readonly pageSize = 10;
  readonly destroy$ = new Subject();
  readonly actions: {type: AgreementAction[], label: string}[] = AgreementActionFilters;
  pages$: Observable<number>;

  form = new FormGroup({
    actions: new FormControl(null)
  });

  constructor(
    public store: Store,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.store.dispatch(new Fetch({actions: JSON.parse(this.form.value.actions)}, 0, this.pageSize));
      }
    );
    if (this.route.snapshot.queryParams.actions) {
      this.form.get('actions').setValue(this.route.snapshot.queryParams.actions);
    }
    this.form.valueChanges.subscribe(
      () => {
        this.router.navigate(["."], {relativeTo: this.route, queryParams: {actions: this.form.value.actions}});
      });
  }

  loadPage(page: number) {
    this.store.dispatch(
      new Fetch({actions: JSON.parse(this.form.value.actions)}, (page - 1) * this.pageSize, this.pageSize)
    );
  }

  stringifyActions(actions: AgreementAction[]) {
    return JSON.stringify(actions);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
