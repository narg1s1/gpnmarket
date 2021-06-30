import { RequestFilters } from './../../../../../common/models/request-filters';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, iif, Observable, Subject, throwError } from "rxjs";
import { ProposalGroup } from "../../../../../common/models/proposal-group";
import { catchError, delayWhen, finalize, scan, shareReplay, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { Uuid } from "../../../../../../cart/models/uuid";
import { RequestState } from "../../../../states/request.state";
import { RequestActions } from "../../../../actions/request.actions";
import { UxgBreadcrumbsService, UxgModalComponent } from "uxg";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { Request } from "../../../../../common/models/request";
import { TechnicalCommercialProposals } from "../../../../actions/technical-commercial-proposal.actions";
import { FormBuilder, Validators } from "@angular/forms";
import { TechnicalCommercialProposalGroupFilter } from "../../../../../common/models/technical-commercial-proposal-group-filter";
import { TechnicalCommercialProposalState } from "../../../../states/technical-commercial-proposal.state";
import { ProposalSource } from "../../../../enum/proposal-source";
import { FeatureService } from "../../../../../../core/services/feature.service";
import { ToastActions } from "../../../../../../shared/actions/toast.actions";
import { RequestPosition } from "../../../../../common/models/request-position";
import { TechnicalCommercialProposalGroupService } from "../../../../services/technical-commercial-proposal-group.service";
import FetchAvailablePositions = TechnicalCommercialProposals.FetchAvailablePositions;
import UploadTemplate = TechnicalCommercialProposals.UploadTemplate;
import FetchProcedures = TechnicalCommercialProposals.FetchProcedures;
import RefreshProcedures = TechnicalCommercialProposals.RefreshProcedures;
import DownloadTemplate = TechnicalCommercialProposals.DownloadTemplate;

@Component({
  selector: 'app-technical-commercial-proposal-group-list',
  templateUrl: './technical-commercial-proposal-group-list.component.html'
})
export class TechnicalCommercialProposalGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(TechnicalCommercialProposalState.availablePositions) availablePositions$: Observable<RequestPosition[]>;
  @Select(TechnicalCommercialProposalState.allowCreate) allowCreate$: Observable<boolean>;
  requestId: Uuid;
  destroy$ = new Subject();

  readonly procedureSource = ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL;
  readonly newGroup$ = new BehaviorSubject<ProposalGroup>(null);
  readonly filter$ = new BehaviorSubject<TechnicalCommercialProposalGroupFilter>({});
  readonly form = this.fb.group({ requestPositionName: null, createdDateFrom: null, createdDateTo: null });
  readonly formTemplate = this.fb.group({
    technicalCommercialProposalGroupName: [null, [Validators.required]],
    fileTemplate: [null, [Validators.required]]
  });

  readonly groups$: Observable<ProposalGroup[]> = this.route.params.pipe(
    tap(({ id }) => this.requestId = id),
    delayWhen(({ id }) => this.store.dispatch([
      new RequestActions.Fetch(id),
      new FetchAvailablePositions(id, null, null, {isOnlyNotInTcpGroup: true}),
      new FetchProcedures(id)
    ])),
    withLatestFrom(this.request$),
    tap(([, { id, number }]) => this.bc.breadcrumbs = [
      { label: "Заявки", link: "/requests/backoffice" },
      { label: `Заявка №${number}`, link: `/requests/backoffice/${id}` },
      { label: 'Согласование ТКП', link: `/requests/backoffice/${id}/technical-commercial-proposals`},
    ]),
    switchMap(groups => this.newGroup$.pipe(
      tap(g => g && this.store.dispatch(new FetchAvailablePositions(this.requestId, null, null, {isOnlyNotInTcpGroup: true}))),
      scan((acc, group) => {
      if (group) {
        const i = acc.findIndex(({id}) => group?.id === id);
        i !== -1 ? acc[i] = group : acc.push(group);
      }

      return acc;
    }, groups))),
    switchMap(() => this.filter$),
    switchMap(filter => this.service.list(this.requestId, filter)),
    shareReplay(1)
  );

  readonly updateProcedures = (request: Request) => [new RefreshProcedures(request.id), new FetchAvailablePositions(request.id, null, null, {isOnlyNotInTcpGroup: true})];
  readonly fetchAvailablePositions = (request: Request, payload?: { positionNameOrNumber: string, filters: RequestFilters }) => {
    return new FetchAvailablePositions(request.id, null, payload?.positionNameOrNumber, payload?.filters);
  }
  readonly downloadTemplate = (request: Request) => new DownloadTemplate(request.id);
  readonly uploadTemplate = (groupName: string, files: File[]) => this.store.dispatch(
    new UploadTemplate(this.requestId, files, null, groupName)
  ).pipe(finalize(() => this.store.dispatch(new FetchAvailablePositions(this.requestId, null, null, {isOnlyNotInTcpGroup: true})))).subscribe()

  constructor(
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private actions: Actions,
    public featureService: FeatureService,
    public store: Store,
    public service: TechnicalCommercialProposalGroupService
  ) {}

  ngOnInit() {
    this.actions.pipe(
      ofActionCompleted(UploadTemplate),
      throttleTime(1),
      takeUntil(this.destroy$)
    ).subscribe(({result}) => {
      const e = result.error as any;
      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) :
        new ToastActions.Success(`Группа ТКП успешно сохранена`));
      if (!e) { this.updateGroups(); }
    });
  }

  updateGroups(): void {
    this.service.list(this.requestId).subscribe(groups => {
      groups.forEach(group => this.newGroup$.next(group));
    });
  }

  saveGroup(body: Partial<ProposalGroup<Uuid>>) {
    iif(() => !body?.id,
      this.service.create(this.requestId, body),
      this.service.update(this.requestId, body?.id, body)
    ).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.store.dispatch(new ToastActions.Error(err?.error?.detail || "Ошибка при сохранении КП"));
        return throwError(err);
      }),
    ).subscribe(group => this.newGroup$.next(group));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
