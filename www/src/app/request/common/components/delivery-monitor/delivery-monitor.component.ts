import { Component, HostListener, Input, OnInit } from '@angular/core';
import { RequestPosition } from "../../models/request-position";
import { DeliveryMonitorService } from "../../services/delivery-monitor.service";
import { DeliveryMonitorInfo } from "../../models/delivery-monitor-info";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DeliveryMonitorConsignment } from "../../models/delivery-monitor-consignment";
import { DeliveryMonitorStatus } from "../../enum/delivery-monitor-status";
import { DeliveryMonitorStatusLabels } from "../../dictionaries/delivery-monitor-status-labels";
import { Uuid } from "../../../../cart/models/uuid";
import { InspectorInfo } from "../../models/inspector-info";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PositionStatuses } from "../../dictionaries/position-statuses";
import { PositionStatus } from "../../enum/position-status";
import { ToastActions } from "../../../../shared/actions/toast.actions";

@Component({
  selector: 'app-request-delivery-monitor',
  templateUrl: './delivery-monitor.component.html',
  styleUrls: ['./delivery-monitor.component.scss']
})
export class DeliveryMonitorComponent implements OnInit {

  @Input() requestId: Uuid;
  requestPositionValue: RequestPosition; // TODO: 2019-11-20 Убрать после демо
  readonly folded = [];

  @Input()
  set requestPosition(value: RequestPosition) {
    this.requestPositionValue = value;
    this.goodId = this.getGoodId();
    this.getDeliveryMonitorInfo();
  }

  get requestPosition(): RequestPosition {
    return this.requestPositionValue;
  }

  deliveryMonitorInfo$: Observable<DeliveryMonitorInfo>;
  inspectorStages: InspectorInfo[];
  consignments$: Observable<DeliveryMonitorConsignment[]>;

  opened = false;
  shiftCount = 0;

  goodId: string;

  assignIdForm = new FormGroup({
    newGoodId: new FormControl('', Validators.required),
  });

  newEventForm = new FormGroup({
    occurredAt: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  constructor(
    private store: Store,
    private deliveryMonitorService: DeliveryMonitorService
  ) { }

  @HostListener('document:keyup', ['$event'])
  resetShift(e: KeyboardEvent) {
    if (e.key !== "Shift") {
      this.shiftCount = 0;
    }
  }

  @HostListener('document:keyup.shift')
  onShift() {
    if (this.opened) {
      return;
    }

    this.shiftCount++;

    if (this.shiftCount === 5) {
      this.store.dispatch(new ToastActions.Warning('Активация...'));
    }

    if (this.shiftCount === 10) {
      this.shiftCount = 0;
      this.opened = true;
    }
  }

  ngOnInit() {
    this.goodId = this.getGoodId(); // TODO: 2019-11-20 Убрать после демо
    this.getDeliveryMonitorInfo();
  }

  getDeliveryMonitorInfo(): void {
    this.deliveryMonitorInfo$ = this.deliveryMonitorService.getDeliveryMonitorInfo(this.requestPosition.id);
    this.consignments$ = this.deliveryMonitorInfo$
      .pipe(map(deliveryMonitorInfo => deliveryMonitorInfo.consignments ));
  }

  getShipmentItemShippingDate(consignment: DeliveryMonitorConsignment): string {
    const shipmentItemCreatedDate = consignment.factualShipmentDate || consignment.planeShipmentDate || null;
    return shipmentItemCreatedDate ? moment(shipmentItemCreatedDate).locale("ru").format('dd, DD.MM') : '—';
  }

  getShipmentItemEstimatedArrivalDate(consignment: DeliveryMonitorConsignment): string {
    if (this.isEmptyArray(consignment.waybills)) {
      return '—';
    }

    let estimatedDates: Date[] = [];

    for (let i = 0; i < consignment.waybills.length; i++) {
      const waybill = consignment.waybills[i];
      if (waybill.estimatedDateOfArrival) {
        estimatedDates.push(waybill.estimatedDateOfArrival);
      }
    }

    if (this.isEmptyArray(estimatedDates)) {
      return '—';
    }

    if (estimatedDates.length > 1) {
      estimatedDates = estimatedDates.sort(
        (a, b) => moment(a).unix() - moment(b).unix()
      );
    }

    return moment(estimatedDates[0]).locale("ru").format('dd, DD.MM');
  }

  getShipmentItemExpectedArrivalDate(consignment: DeliveryMonitorConsignment): string {
    if (this.isEmptyArray(consignment.waybills)) {
      return '—';
    }

    let dates: Date[] = [];

    for (let i = 0; i < consignment.waybills.length; i++) {
      const waybill = consignment.waybills[i];
      if (waybill.expectedDateOfArrival) {
        dates.push(waybill.expectedDateOfArrival);
      }
    }

    if (this.isEmptyArray(dates)) {
      return '—';
    }

    if (dates.length > 1) {
      dates = dates.sort(
        (a, b) => moment(a).unix() - moment(b).unix()
      );
    }

    return moment(dates[0]).locale("ru").format('dd, DD.MM');
  }

  getShipmentItemActualArrivalDate(consignment: DeliveryMonitorConsignment): string {
    if (this.isEmptyArray(consignment.waybills)) {
      return '—';
    }

    let dates: Date[] = [];

    for (let i = 0; i < consignment.waybills.length; i++) {
      const waybill = consignment.waybills[i];
      if (waybill.actualArrivalDate) {
        dates.push(waybill.actualArrivalDate);
      }
    }

    if (this.isEmptyArray(dates)) {
      return '—';
    }

    if (dates.length > 1) {
      dates = dates.sort(
        (a, b) => moment(a).unix() - moment(b).unix()
      );
    }

    return moment(dates[0]).locale("ru").format('dd, DD.MM');
  }

  deliveryMonitorInfoCanBeShown() {
    const deliveryStatusIndex = PositionStatuses.indexOf(PositionStatus.DELIVERY);
    const currentStatusIndex = PositionStatuses.indexOf(
      this.requestPositionValue.status
    );
    return currentStatusIndex >= deliveryStatusIndex;
  }

  consignmentCanBeShown(consignment: DeliveryMonitorConsignment): boolean {
    return (
      !this.isEmptyArray(consignment.cargos)
    );
  }

  canGetWaybillInfo(consignment: DeliveryMonitorConsignment): boolean {
    return ((!!consignment.waybills) && (!!consignment.waybills[0]));
  }

  getWeightByTd(consignment: DeliveryMonitorConsignment): number|string {
    if (this.isEmptyArray(consignment.cargos)) {
      return '—';
    }
    return consignment.cargos.reduce(
      (acc, cargo) => acc + (cargo.weightByTd || cargo.amountEi || 0), 0
    );
  }

  getWeightEiByTd(consignment: DeliveryMonitorConsignment): string {
    if (this.isEmptyArray(consignment.cargos)) {
      return '—';
    }
    return consignment.cargos[0].eiCargoAmount;
  }

  getWaybillNumber(consignment: DeliveryMonitorConsignment): string {
    if (this.isEmptyArray(consignment.waybills)) {
      return '—';
    }
    return consignment.waybills.map((waybill) => {
      return waybill.waybillNumber;
    }).join(', ');
  }

  getVehicleNumber(consignment: DeliveryMonitorConsignment): string {
    const numbers = new Set<string>();

    if (this.isEmptyArray(consignment.waybills)) {
      return '—';
    }

    for (let i = 0; i < consignment.waybills.length; i++) {
      const waybill = consignment.waybills[i];
      if (this.isEmptyArray(waybill.deliveryVehicles)) {
        continue;
      }

      for (let j = 0; j < waybill.deliveryVehicles.length; j++) {
        const deliveryVehicle = waybill.deliveryVehicles[j];

        if (!deliveryVehicle.vehicle) {
          continue;
        }

        numbers.add(deliveryVehicle.vehicle.vehicleNumber);
      }
    }

    return [ ...numbers.values() ].join(', ');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case DeliveryMonitorStatus.PENDING:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.PENDING];
      case DeliveryMonitorStatus.LOADED:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.LOADED];
      case DeliveryMonitorStatus.MOVING:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.MOVING];
      case DeliveryMonitorStatus.ARRIVED:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.ARRIVED];
    }
  }

  assignIdSubmit() {
    if (this.assignIdForm.invalid) {
      this.store.dispatch(new ToastActions.Error('Заполните поле!'));
      return;
    }

    const formData = this.assignIdForm.value;
    this.assignIdForm.reset();
    this.deliveryMonitorService.assignNewGoodId(this.requestPosition.id, formData).subscribe();
    this.store.dispatch(new ToastActions.Success('Идентификатор товара заменен'));
  }

  newEventSubmit() {
    if (this.newEventForm.invalid) {
      this.store.dispatch(new ToastActions.Error('Заполните все поля!'));
      return;
    }

    const formData = this.newEventForm.value;
    formData.occurredAt = new Date(this.newEventForm.value.occurredAt);
    formData.positionId = this.requestPosition.id;

    this.newEventForm.reset();
    this.deliveryMonitorService.addInspectorStage(formData).subscribe();
    this.store.dispatch(new ToastActions.Success('Событие добавлено'));
    this.inspectorStages.push(formData);
  }

  protected getGoodId(): string {
    const positionName = this.requestPositionValue.name;
    const re = /^Установка.*$/i;
    return positionName.match(re) ? '1' : '2';
  }

  protected isEmptyArray(a?: Array<any>|null): boolean {
    return Boolean(!a || a.length === 0);
  }
}
