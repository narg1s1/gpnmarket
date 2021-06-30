import { UserInfoService } from './../../../../user/service/user-info.service';
import { Component, OnInit } from '@angular/core';
import { Uuid } from "../../../../cart/models/uuid";
import { Observable } from "rxjs";
import { RequestPosition } from "../../../common/models/request-position";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { UxgBreadcrumbsService } from "uxg";
import { Store } from "@ngxs/store";
import { switchMap, tap } from "rxjs/operators";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { PositionStatus } from "../../../common/enum/position-status";
import { PositionService } from "../../../customer/services/position.service";
import { PositionDocuments } from "../../../common/models/position-documents";

@Component({
  templateUrl: './position.component.html',
})
export class PositionComponent implements OnInit {
  requestId: Uuid;
  positionId: Uuid;
  position$: Observable<RequestPosition>;
  readonly documents$: Observable<PositionDocuments> = this.route.params.pipe(
    switchMap(({ positionId }) => this.positionService.documents(positionId)));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private bc: UxgBreadcrumbsService,
    private store: Store,
    private positionService: PositionService,
    private userInfoService: UserInfoService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(() => this.getData());
  }

  getData() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    this.positionId = this.route.snapshot.paramMap.get('positionId');
    this.position$ = this.positionService.info(this.requestId, this.positionId)
      .pipe(tap(position => this.setPageInfo(position)));
  }

  setPageInfo(position: RequestPosition) {
    this.title.setTitle(position.name);

    this.bc.breadcrumbs = [
      { label: 'Заявки', link: `/requests/approver` },
      { label: `Заявка №${position.request.number}`, link: `/requests/approver/${this.requestId}`, queryParams: {
          showOnlyApproved: position.status === "PROOF_OF_NEED" ? '0' : '1'
        } },
      { label: position.name, link: `/requests/approver/${this.requestId}/${position.id}` }
    ];
  }

  rejectPositions(positionIds: Uuid[], comment, useAllPositions: boolean) {
    const newStatus = this.userInfoService.isCustomerApprover()
      ? PositionStatus.DRAFT
      : this.userInfoService.isCustomer()
        ? PositionStatus.CANCELED
        : PositionStatus.NOT_RELEVANT;
    this.positionService.changePositionsStatus(
      this.requestId,
      positionIds,
      newStatus,
      useAllPositions,
      [comment]
    ).pipe(tap(() => {
      this.store.dispatch(new ToastActions.Success('Позиция отклонена'));
      this.position$ = this.positionService.info(this.requestId, this.positionId);
    })).subscribe();
  }

  approvePositions(positionIds: Uuid[], useAllPositions: boolean) {
    this.positionService.changePositionsStatus(this.requestId, positionIds, PositionStatus.NEW, useAllPositions).pipe(tap(() => {
      this.store.dispatch(new ToastActions.Success('Позиция успешно согласована'));
      this.position$ = this.positionService.info(this.requestId, this.positionId);
    })).subscribe();
  }
}
