import { Component, OnInit, OnDestroy, ViewChildren, QueryList, Input, EventEmitter, Output } from '@angular/core';
import { DashboardView } from "../../models/dashboard-view";
import { Store } from "@ngxs/store";
import { Agreement } from "../../../../agreements/common/models/Agreement";
import { StateStatus } from "../../../../request/common/models/state-status";
import { DashboardTaskItem } from "../../models/dashboard-task-item";
import { Subject } from "rxjs";

@Component({
  selector: 'app-dashboard-agreements',
  templateUrl: './dashboard-agreements.component.html',
  styleUrls: ['./dashboard-agreements.component.scss']
})
export class DashboardAgreementsComponent implements OnInit, OnDestroy {
  @Input() agreements: Agreement[];
  @Input() tasks: Agreement[];
  @Input() status: StateStatus;
  @Input() tasksTotalCount: number;
  @Input() agreementsTotalCount: number;
  @Input() agreementsBar: DashboardTaskItem[];
  @Input() tasksBar: DashboardTaskItem[];
  @Input() view: DashboardView = "tasks";
  @Output() sendRating = new EventEmitter<{requestId, positionId, rating}>();

  destroy$ = new Subject();

  constructor(
    public store: Store
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
