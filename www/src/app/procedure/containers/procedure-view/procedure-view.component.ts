import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { UxgBreadcrumbsService } from "uxg";
import { ActivatedRoute, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { RequestPosition } from "../../../request/common/models/request-position";
import { Uuid } from "../../../cart/models/uuid";
import { ProposalSource } from "../../../request/back-office/enum/proposal-source";
import { Procedure } from "../../../request/back-office/models/procedure";
import { ProcedureAction } from "../../../request/back-office/models/procedure-action";
import { StateStatus } from "../../../request/common/models/state-status";
import { ProcedureState } from "../../states/procedure.state";
import { ProcedureActions } from "../../actions/procedure.actions";
import FetchProcedure = ProcedureActions.FetchProcedure;


@Component({
  selector: 'app-procedure-view',
  templateUrl: './procedure-view.component.html',
})
export class ProcedureViewComponent implements OnDestroy, OnInit {

  @Select(ProcedureState.procedure) procedure$: Observable<Procedure>;
  readonly destroy$ = new Subject();

  @Output() bargain = new EventEmitter();
  @Output() prolong = new EventEmitter();

  sourceFromUrl: ProposalSource;
  procedureUid: Uuid;
  procedureId: number;
  positions: RequestPosition[]|null;

  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  prolongModalPayload: Procedure;

  state: StateStatus = "pristine";

  constructor(
    private bc: UxgBreadcrumbsService,
    private route: ActivatedRoute,
    protected router: Router,
    public store: Store
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sourceFromUrl = params.source;
    });

    this.route.params.pipe(
      tap(({id}) => this.procedureUid = id),
      switchMap(({id}) => this.store.dispatch(new FetchProcedure(this.procedureUid))),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  refreshProcedures() {
    this.state = "updating";
    this.store.dispatch(new FetchProcedure(this.procedureUid));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
