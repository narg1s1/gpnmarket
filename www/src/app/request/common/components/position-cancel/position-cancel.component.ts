import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequestPosition } from "../../models/request-position";
import { PositionCancelReasonLabels } from "../../dictionaries/position-cancel-reason-labels";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { PositionService } from "../../../back-office/services/position.service";
import { Store } from "@ngxs/store";
import { Uuid } from "../../../../cart/models/uuid";
import { RequestActions as BackofficeRequestActions } from "../../../back-office/actions/request.actions";
import { RequestActions as CustomerRequestActions } from "../../../customer/actions/request.actions";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { PositionStatus } from "../../enum/position-status";
import BackofficeRefreshRequest = BackofficeRequestActions.Refresh;
import CustomerRefreshRequest = CustomerRequestActions.Refresh;
import CustomerAttachDocuments = CustomerRequestActions.AttachDocuments;
import BackofficeAttachDocuments = BackofficeRequestActions.AttachDocuments;
import { RequestFilters } from "../../models/request-filters";

@Component({
  selector: 'app-position-cancel',
  templateUrl: './position-cancel.component.html',
  styleUrls: ['./position-cancel.component.scss']
})
export class PositionCancelComponent implements OnInit {
  @Input() positions: RequestPosition[];
  @Input() requestId: Uuid;
  @Input() useAllPositions: boolean;
  @Input() activeFilters: RequestFilters;
  @Output() close = new EventEmitter();
  @Output() complete = new EventEmitter();

  form: FormGroup;

  readonly positionCancelReason = Object.entries(PositionCancelReasonLabels);

  constructor(
    private formBuilder: FormBuilder,
    private positionService: PositionService,
    private store: Store,
    public user: UserInfoService
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      reason: ['', Validators.required],
      comment: [''],
      documents: [[]]
    });

    if (this.user.isCustomer()) {
      this.form.disable();
    }
  }

  submit() {
    const cancelReason = this.form.value.comment || this.form.value.reason;
    const cancelAttachedFiles = this.form.value.documents;

    const positionIds = this.positions.map(({ id }: RequestPosition) => id);
    const [newStatus, role] = this.user.isCustomerApprover()
      ? [PositionStatus.DRAFT, 'customer']
      : this.user.isCustomer()
        ? [PositionStatus.CANCELED, 'customer']
        : [PositionStatus.NOT_RELEVANT, 'backoffice'];

    this.positionService.changePositionsStatus(this.requestId, positionIds, newStatus, role, this.useAllPositions, [cancelReason], this.activeFilters).subscribe(() => {
      this.complete.emit();
      if (this.requestId) {
        this.store.dispatch(this.user.isCustomer() ?
          [
            new CustomerRefreshRequest(this.requestId),
            cancelAttachedFiles.length ? new CustomerAttachDocuments(this.requestId, positionIds, cancelAttachedFiles, this.useAllPositions) : false
          ] :
          [
            new BackofficeRefreshRequest(this.requestId),
            cancelAttachedFiles.length ? new BackofficeAttachDocuments(this.requestId, positionIds, cancelAttachedFiles, this.useAllPositions, this.activeFilters) : false
          ]
        );
      }
      this.store.dispatch(new ToastActions.Success(positionIds.length === 1 ? 'Позиция отменена' : 'Позиции отменены'));
    }, () => {
      this.store.dispatch(new ToastActions.Error(positionIds.length === 1 ? 'Ошибка отмены позиции' : 'Ошибка отмены позиций'));
    });
    this.close.emit();
    this.form.reset();
  }
}
