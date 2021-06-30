import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { Agreement } from "../../../../agreements/common/models/Agreement";
import { StateStatus } from "../../../../request/common/models/state-status";
import { Observable, Subject } from "rxjs";
import { DashboardTaskItem } from "../../../common/models/dashboard-task-item";
import { AgreementsService } from "../../../../agreements/customer/services/agreements.service";
import { NotificationService } from "../../../../notification/services/notification.service";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { DashboardActions } from "../../actions/dashboard.actions";
import { DashboardState } from "../../states/dashboard.state";
import { DashboardView } from "../../../common/models/dashboard-view";
import { StatusesStatisticsInfo } from "../../../common/models/statuses-statistics";
import {
  DashboardAvailableFiltersApplicantItem,
  DashboardAvailableFiltersRequestItem
} from "../../../common/models/dashboard-available-filters";
import { DashboardStatisticsComponent } from "../../../common/components/dashboard-statistics/dashboard-statistics.component";
import { takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { AgreementListActions } from "../../../../agreements/customer/actions/agreement-list.actions";
import Fetch = DashboardActions.Fetch;
import FetchStatusesStatistics = DashboardActions.FetchStatusesStatistics;
import FetchAvailableFilters = DashboardActions.FetchAvailableFilters;
import Rate = AgreementListActions.Rate;
import { Uuid } from "../../../../cart/models/uuid";

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('dashboardStatisticsComponent') dashboardStatisticsComponent: DashboardStatisticsComponent;

  @Select(DashboardState.agreements) agreements$: Observable<Agreement[]>;
  @Select(DashboardState.status) status$: Observable<StateStatus>;
  @Select(DashboardState.agreementsTotalCount) agreementsTotalCount$: Observable<number>;
  @Select(DashboardState.agreementsBar) agreementsBar$: Observable<DashboardTaskItem[]>;

  view: DashboardView = "agreements";

  @Select(DashboardState.statusesStatistics) statusesStatistics$: Observable<StatusesStatisticsInfo>;
  @Select(DashboardState.filterRequestList) filterRequestList$: Observable<DashboardAvailableFiltersRequestItem[]>;
  @Select(DashboardState.filterApplicantsList) filterApplicantsList$: Observable<DashboardAvailableFiltersApplicantItem[]>;

  destroy$ = new Subject();

  constructor(
    public store: Store,
    public user: UserInfoService,
    private agreementsService: AgreementsService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private actions: Actions
  ) {}

  ngOnInit() {
    this.store.dispatch(new Fetch());

    this.route.params.pipe(
      tap(() => this.store.dispatch([new FetchStatusesStatistics({}), new FetchAvailableFilters({})]).subscribe(() => {
        this.cd.detectChanges();
      })),
      withLatestFrom(this.statusesStatistics$),
      takeUntil(this.destroy$)
    ).subscribe();

    this.actions.pipe(
      ofActionCompleted(Rate),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(new Fetch()).subscribe(() => {
        this.cd.detectChanges();
      });
    });
  }

  submitFilter() {
    this.updateSelectedItemsCount();

    const filters = {
      requestIds: this.dashboardStatisticsComponent.selectedRequests,
      userIds: this.dashboardStatisticsComponent.selectedApplicants,
      shipmentDateFrom: this.dashboardStatisticsComponent.form.get('shipmentDateFrom').value,
      shipmentDateTo: this.dashboardStatisticsComponent.form.get('shipmentDateTo').value,
    };

    for (const [key, value] of Object.entries(filters)) {
      if (!value?.length) { delete filters[key]; }
    }

    this.store.dispatch(new FetchStatusesStatistics(filters));
    this.store.dispatch(new FetchAvailableFilters(filters)).subscribe(() => {
      this.updateSelectedItemsCount();
    });
  }

  updateSelectedItemsCount(): void {
    this.dashboardStatisticsComponent.requestsSelectList.submit();
    this.dashboardStatisticsComponent.applicantsSelectList.submit();

    this.dashboardStatisticsComponent.selectedRequests = this.dashboardStatisticsComponent.form.get('requests').value?.map(request => request.id);
    this.dashboardStatisticsComponent.selectedApplicants = this.dashboardStatisticsComponent.form.get('userIds').value?.map(applicant => applicant.id);
  }

  resetFilter(): void {
    this.dashboardStatisticsComponent.requestsSelectList.form.get('checked').reset(null, {emitEvent: false});
    this.dashboardStatisticsComponent.applicantsSelectList.form.get('checked').reset(null, {emitEvent: false});

    this.dashboardStatisticsComponent.form.reset({
      requests: null,
      userIds: null,
      shipmentDateFrom: null,
      shipmentDateTo: null,
    }, {emitEvent: false});

    this.dashboardStatisticsComponent.selectedRequests = [];
    this.dashboardStatisticsComponent.selectedApplicants = [];

    this.store.dispatch(new FetchAvailableFilters({}));
    this.store.dispatch(new FetchStatusesStatistics({}));
  }

  sendRating(requestId: Uuid, positionId: Uuid, rating: number): void {
    this.store.dispatch(new Rate(requestId, positionId, rating)).subscribe(() => {
      this.cd.detectChanges();
    });
  }
}
