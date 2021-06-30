import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnDestroy } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { merge, Observable, of, Subject, Subscription } from "rxjs";
import { UxgBreadcrumbsService } from "uxg";
import { switchMap, tap } from "rxjs/operators";
import { RequestPosition } from "../../../common/models/request-position";
import { RequestService } from "../../services/request.service";
import { Uuid } from "../../../../cart/models/uuid";
import { PositionStatusesLabels } from "../../../common/dictionaries/position-statuses-labels";
import { Store } from "@ngxs/store";
import { RequestActions } from "../../actions/request.actions";
import { PositionDocuments } from "../../../common/models/position-documents";
import { PositionService } from "../../services/position.service";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { AppConfig } from "../../../../config/app.config";
import { PluralizePipe } from "../../../../shared/pipes/pluralize-pipe";
import { BytesToSizePipe } from "../../../../shared/pipes/bytes-to-size-pipe";

@Component({ templateUrl: './position.component.html' })
export class PositionComponent implements OnDestroy {
  requestId: Uuid;
  positionId: Uuid;
  position$: Observable<RequestPosition>;
  subscription = new Subscription();
  statuses = [];

  public singleFileSizeLimit: number = AppConfig.files.singleFileSizeLimit;
  public totalFilesSizeLimit: number = AppConfig.files.totalFilesSizeLimit;

  readonly documentsSubject$ = new Subject<PositionDocuments>();
  readonly documents$: Observable<PositionDocuments> = merge(this.documentsSubject$, this.route.params.pipe(
    switchMap(({ positionId }) => this.positionService.documents(positionId))));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private positionService: PositionService,
    private pluralize: PluralizePipe,
    private bytesToSize: BytesToSizePipe,
    private title: Title,
    private store: Store,
    private bc: UxgBreadcrumbsService
  ) {
    this.route.params.subscribe(() => this.getData());
  }

  getData() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    this.positionId = this.route.snapshot.paramMap.get('positionId');
    this.position$ = this.positionService.info(this.requestId, this.positionId).pipe(tap(position => {
      this.setPageInfo(position);
      this.updateAvailableStatuses(position);
    }));
  }

  updateData(position: RequestPosition) {
    this.setPageInfo(position);
    this.updateAvailableStatuses(position);
    this.position$ = of(position);
  }

  updateAvailableStatuses(position: RequestPosition) {
    this.statuses = Object.entries(PositionStatusesLabels)
      .filter(item => position.availableStatuses.indexOf(item[0]) >= 0);
  }

  setPageInfo(position: RequestPosition) {
    this.title.setTitle(position.name);

    this.bc.breadcrumbs = [
      { label: 'Заявки', link: `/requests/backoffice` },
      { label: `Заявка №${position.request.number}`, link: `/requests/backoffice/${this.requestId}`},
      { label: position.name, link: `/requests/backoffice/${this.requestId}/${position.id}` }
    ];
  }

  changeStatus(data: {status, position}) {
    data.position.statusLabel = data.status.label;
    data.position.status = data.status.value;
    data.position.inQueue = true;

    this.requestService.changeStatus(this.requestId, data.position.id, data.position.status).subscribe(
      response => {
        data.position.availableStatuses = response.availableStatuses;
        this.updateAvailableStatuses(data.position);

        this.position$ = of(data.position);
      }
    );
  }

  uploadDocuments({files, position}: {files: File[], position: RequestPosition}) {
    this.position$ = of(position);

    const hasLargeFiles = files.some(file => file.size > this.singleFileSizeLimit);

    const validFiles = files.filter(file => file.size <= this.singleFileSizeLimit);
    const invalidFiles = files.filter(file => file.size > this.singleFileSizeLimit);

    if (hasLargeFiles) {
      this.store.dispatch(
        new ToastActions.Error(
          this.pluralize.transform(invalidFiles.length, "документ не загружен", "документа не загружены", "документов не загружено") +
          ', так как размер превышает ' + this.bytesToSize.transform(this.singleFileSizeLimit, 3)));
    }

    if (validFiles.length) {
      this.positionService.uploadDocuments(position, validFiles).pipe(
        switchMap(() => this.positionService.documents(position.id)),
        tap(docs => this.documentsSubject$.next(docs))
      ).subscribe();
    }
  }

  sendOnApprove = (position: RequestPosition): Observable<RequestPosition> => this.store
    .dispatch(new RequestActions.Publish(this.requestId, false, [position.id])).pipe(
      switchMap(() => this.positionService.info(this.requestId, position.id))
    )

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
