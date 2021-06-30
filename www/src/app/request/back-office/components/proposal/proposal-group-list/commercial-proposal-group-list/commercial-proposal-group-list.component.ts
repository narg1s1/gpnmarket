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
import { CommercialProposalsActions } from "../../../../actions/commercial-proposal.actions";
import { FormBuilder, Validators } from "@angular/forms";
import { ProposalGroupFilter } from "../../../../../common/models/proposal-group-filter";
import { CommercialProposalState } from "../../../../states/commercial-proposal.state";
import { ProposalSource } from "../../../../enum/proposal-source";
import { FeatureService } from "../../../../../../core/services/feature.service";
import { ToastActions } from "../../../../../../shared/actions/toast.actions";
import { RequestPosition } from "../../../../../common/models/request-position";
import { CommercialProposalGroupService } from "../../../../services/commercial-proposal-group.service";
import FetchAvailablePositions = CommercialProposalsActions.FetchAvailablePositions;
import UploadTemplate = CommercialProposalsActions.UploadTemplate;
import FetchProcedures = CommercialProposalsActions.FetchProcedures;
import RefreshProcedures = CommercialProposalsActions.RefreshProcedures;
import DownloadTemplate = CommercialProposalsActions.DownloadTemplate;
import { CommercialProposalsService } from "../../../../services/commercial-proposals.service";

@Component({
  selector: 'app-commercial-proposal-group-list',
  templateUrl: './commercial-proposal-group-list.component.html'
})
export class CommercialProposalGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(CommercialProposalState.availablePositions) availablePositions$: Observable<RequestPosition[]>;
  @Select(CommercialProposalState.allowCreate) allowCreate$: Observable<boolean>;
  requestId: Uuid;
  destroy$ = new Subject();

  readonly procedureSource = ProposalSource.COMMERCIAL_PROPOSAL;
  readonly newGroup$ = new BehaviorSubject<ProposalGroup>(null);
  readonly filter$ = new BehaviorSubject<ProposalGroupFilter>({});
  readonly form = this.fb.group({ requestPositionName: null, createdDateFrom: null, createdDateTo: null });
  readonly formTemplate = this.fb.group({
    commercialProposalGroupName: [null, [Validators.required]],
    fileTemplate: [null, [Validators.required]]
  });
  readonly procedurePositionsSelected$ = new Subject<Uuid[]>();
  readonly contragentsWithTp$ = this.procedurePositionsSelected$.pipe(
    withLatestFrom(this.route.params),
    switchMap(([ids, { id }]) => this.commercialProposalsService.getContragentsWithTp(id, ids))
  );

  readonly groups$: Observable<ProposalGroup[]> = this.route.params.pipe(
    tap(({ id }) => this.requestId = id),
    delayWhen(({ id }) => this.store.dispatch([new RequestActions.Fetch(id), new FetchAvailablePositions(id), new FetchProcedures(id)])),
    withLatestFrom(this.request$),
    tap(([, { id, number }]) => this.bc.breadcrumbs = [
      { label: "Заявки", link: "/requests/backoffice" },
      { label: `Заявка №${number}`, link: `/requests/backoffice/${id}` },
      { label: 'Согласование КП', link: `/requests/backoffice/${id}/commercial-proposals`},
    ]),
    switchMap(groups => this.newGroup$.pipe(
      tap(g => g && this.store.dispatch(new FetchAvailablePositions(this.requestId))),
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

  readonly updateProcedures = (request: Request) => [new RefreshProcedures(request.id), new FetchAvailablePositions(request.id)];
  readonly fetchAvailablePositions = (request: Request, search?: string) => new FetchAvailablePositions(request.id, null, search);
  readonly downloadTemplate = (request: Request) => new DownloadTemplate(request.id);
  readonly uploadTemplate = (groupName: string, files: File[]) => this.store.dispatch(
    new UploadTemplate(this.requestId, files, null, groupName)
  ).pipe(finalize(() => this.store.dispatch(new FetchAvailablePositions(this.requestId)))).subscribe()

  constructor(
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private actions: Actions,
    public featureService: FeatureService,
    public store: Store,
    public service: CommercialProposalGroupService,
    public commercialProposalsService: CommercialProposalsService,
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
        new ToastActions.Success(`Группа КП успешно сохранена`));
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
        this.store.dispatch(new ToastActions.Error(err?.error?.detail || "Ошибка при сохранении ТКП"));
        return throwError(err);
      }),
    ).subscribe(group => this.newGroup$.next(group));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
