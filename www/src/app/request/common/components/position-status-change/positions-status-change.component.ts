import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PositionStatusesLabels } from "../../dictionaries/position-statuses-labels";
import { PositionService } from "../../../back-office/services/position.service";
import { RequestPosition } from "../../models/request-position";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { Store } from "@ngxs/store";
import { PositionStatus } from "../../enum/position-status";
import { Uuid } from "../../../../cart/models/uuid";
import { RequestFilters } from "../../models/request-filters";

@Component({
  selector: 'app-positions-status-change',
  templateUrl: './positions-status-change.component.html',
  styleUrls: ['./positions-status-change.component.scss']
})
export class PositionsStatusChangeComponent implements OnInit, OnChanges {

  protected _status: PositionStatus;

  @Input() positions: RequestPosition[];
  @Input() requestId: Uuid;
  @Input() useAllPositions: boolean;
  @Input() activeFilters: RequestFilters;
  @Output() changeStatus = new EventEmitter<string>();
  @Input()
  set status(value: PositionStatus) {
    this._status = value;
    this.newStatus = value;
  }
  get status() {
    return this._status;
  }

  newStatus: PositionStatus;
  statuses = [];
  loading = false;

  constructor(
    private positionService: PositionService,
    private store: Store,
  ) {
  }

  ngOnInit(): void {
    this.newStatus = this.status;

    this.updateAvailableStatuses();
  }

  ngOnChanges(): void {
    this.updateAvailableStatuses();
  }

  updateAvailableStatuses(): void {
    const intersection = this.getIntersectionOfAvailableStatuses();

    this.statuses = Object.entries(PositionStatusesLabels)
      .filter(item => intersection.includes(item[0]));
  }

  getIntersectionOfAvailableStatuses(): string[] {
    if (!this.positions.length) {
      return [];
    }

    let intersection = this.positions[0].availableStatuses;
    for (let i = 1; i < this.positions.length; i++) {
      intersection = this.positions[i].availableStatuses.filter(value => intersection.includes(value));
    }

    return intersection;
  }

  getStatusLabel(status: string): string {
    return PositionStatusesLabels[status];
  }

  onChangeBtn() {
    const positionIds = this.positions.map(function (position: RequestPosition) {
      return position.id;
    });
    this.loading = true;

    this.positionService.changePositionsStatus(this.requestId, positionIds, this.newStatus, 'backoffice', this.useAllPositions, null, this.activeFilters).subscribe(() => {
      this.loading = false;
      this.changeStatus.emit(this.status);
    }, (error) => {
      this.store.dispatch(new ToastActions.Error('Ошибка смены статуса позиций'));
      this.loading = false;
    });
  }

  valid() {
    return this.status !== this.newStatus;
  }
}
