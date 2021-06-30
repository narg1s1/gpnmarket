import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { ProposalGroup } from "../../../../../common/models/proposal-group";
import { delayWhen, shareReplay, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { CommercialProposalsService } from "../../../../services/commercial-proposals.service";
import { RequestState } from "../../../../states/request.state";
import { RequestActions } from "../../../../actions/request.actions";
import { UxgBreadcrumbsService } from "uxg";
import { Select, Store } from "@ngxs/store";
import { Request } from "../../../../../common/models/request";
import { FormBuilder } from "@angular/forms";
import { ProposalGroupFilter } from "../../../../../common/models/proposal-group-filter";

@Component({
  selector: 'app-commercial-proposal-group-list',
  templateUrl: './commercial-proposal-group-list.component.html'
})
export class CommercialProposalGroupListComponent {
  @Select(RequestState.request) request$: Observable<Request>;
  readonly filter$ = new BehaviorSubject<ProposalGroupFilter>({});
  readonly groups$: Observable<ProposalGroup[]> = this.route.params.pipe(
    delayWhen(({ id }) => this.store.dispatch(new RequestActions.Fetch(id))),
    withLatestFrom(this.request$),
    tap(([, { id, number }]) => this.bc.breadcrumbs = [
      { label: "Заявки", link: "/requests/customer" },
      { label: `Заявка №${ number }`, link: `/requests/customer/${ id }` },
      { label: 'Согласование КП', link: `/requests/customer/${ id }/commercial-proposals` },
    ]),
    switchMap(([, { id }]) => this.filter$.pipe(
      switchMap(filter => this.service.groupList(id, filter))
    )),
    shareReplay(1)
  );

  constructor(
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private store: Store,
    public service: CommercialProposalsService,
  ) {}
}
