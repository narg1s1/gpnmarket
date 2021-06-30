import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RequestPosition } from "../../../models/request-position";
import { InspectorInfo } from "../../../models/inspector-info";
import { InspectorStatusLabels } from "../../../dictionaries/inspector-status-labels";
import { DeliveryMonitorService } from "../../../services/delivery-monitor.service";
import { DeliveryMonitorInfo } from "../../../models/delivery-monitor-info";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-request-delivery-monitor-digital-inspector',
  templateUrl: 'delivery-monitor-digital-inspector.component.html',
  styleUrls: ['delivery-monitor-digital-inspector.component.scss']
})

export class DeliveryMonitorDigitalInspectorComponent implements OnInit, OnDestroy {

  @Input() position: RequestPosition;

  subscription = new Subscription();
  inspectorStages: InspectorInfo[];
  productStages: DeliveryMonitorInfo;

  constructor(public deliveryMonitorService: DeliveryMonitorService) {}

  ngOnInit() {
    this.getInspectorStagesInfo();
    this.getInspectorStages();
  }

  getInspectorStagesInfo(): void {
    this.subscription.add(this.deliveryMonitorService.getInspectorInfo(this.position.id).subscribe(
      data => {
        this.inspectorStages = data;
      }));
  }

  getInspectorStages(): void {
    this.subscription.add(this.deliveryMonitorService.getInspectorStages(this.position.id).subscribe(
      data => {
        this.productStages = data;
      }));
  }

  getEventTitleByType(type) {
    return InspectorStatusLabels[type];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
