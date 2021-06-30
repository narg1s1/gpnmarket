import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { StatusesStatisticsInfo } from "../../models/statuses-statistics";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import {
  DashboardAvailableFiltersApplicantItem,
  DashboardAvailableFiltersCustomerItem,
  DashboardAvailableFiltersRequestItem,
  DashboardAvailableFiltersResponsibleUserItem
} from "../../models/dashboard-available-filters";
import { map, takeUntil } from "rxjs/operators";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { SelectItemsWithSearchComponent } from "../../../../shared/components/select-items-with-search/select-items-with-search.component";
import { PluralizePipe } from "../../../../shared/pipes/pluralize-pipe";

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('requestsSelectList') requestsSelectList: SelectItemsWithSearchComponent;
  @ViewChild('customersSelectList') customersSelectList: SelectItemsWithSearchComponent;
  @ViewChild('usersSelectList') usersSelectList: SelectItemsWithSearchComponent;
  @ViewChild('applicantsSelectList') applicantsSelectList: SelectItemsWithSearchComponent;

  @Input() statusesStatistics: StatusesStatisticsInfo;
  @Input() filterRequestList: DashboardAvailableFiltersRequestItem[];
  @Input() filterCustomerList: DashboardAvailableFiltersCustomerItem[];
  @Input() filterResponsibleUsersList: DashboardAvailableFiltersResponsibleUserItem[];
  @Input() filterApplicantsList: DashboardAvailableFiltersApplicantItem[];

  @Output() submitFilter = new EventEmitter();
  @Output() resetFilter = new EventEmitter();

  form = new FormGroup({
    requests: new FormControl(null),
    customers: new FormControl(null),
    users: new FormControl(null),
    userIds: new FormControl(null),
    shipmentDateFrom: new FormControl(null),
    shipmentDateTo: new FormControl(null),
  });

  selectedRequests = [];
  selectedCustomers = [];
  selectedUsers = [];
  selectedApplicants = [];

  getCurrencySymbol = getCurrencySymbol;

  destroy$ = new Subject();
  readonly getDeliveryDate = (min, max): string => min === max ? min : min + " – " + max;

  constructor(
    public store: Store,
    public user: UserInfoService,
    private pluralize: PluralizePipe,
  ) { }

  ngOnInit() {
    this.form.get('shipmentDateFrom').valueChanges.pipe(
      map(() => this.onSubmitFilter()),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form.get('shipmentDateTo').valueChanges.pipe(
      map(() => this.onSubmitFilter()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSubmitFilter() {
    this.submitFilter.emit();
  }

  onResetFilter(): void {
    this.resetFilter.emit();
  }

  toRequestItem(request: any): DashboardAvailableFiltersRequestItem {
    return request as DashboardAvailableFiltersRequestItem;
  }

  toCustomerItem(customer: any): DashboardAvailableFiltersCustomerItem {
    return customer as DashboardAvailableFiltersCustomerItem;
  }

  toResponsibleUserItem(responsibleUser: any): DashboardAvailableFiltersResponsibleUserItem {
    return responsibleUser as DashboardAvailableFiltersResponsibleUserItem;
  }

  toApplicantItem(applicant: any): DashboardAvailableFiltersApplicantItem {
    return applicant as DashboardAvailableFiltersApplicantItem;
  }

  filterRequests(q: string, request: DashboardAvailableFiltersRequestItem): boolean {
    return request?.name.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  filterCustomers(q: string, customer: DashboardAvailableFiltersCustomerItem): boolean {
    return customer?.contragentName.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  filterResponsibleUsers(q: string, user: DashboardAvailableFiltersResponsibleUserItem): boolean {
    return user?.fullName?.toLowerCase()?.indexOf(q.toLowerCase()) >= 0;
  }

  filterApplicants(q: string, user: DashboardAvailableFiltersApplicantItem): boolean {
    return user?.fullName?.toLowerCase()?.indexOf(q.toLowerCase()) >= 0;
  }

  filterIsFilled(): boolean {
    return this.selectedRequests?.length ||
           this.selectedCustomers?.length && this.user.isBackOffice() ||
           this.selectedUsers?.length && (this.user.isSeniorBackoffice() || this.user.isBackofficeObserver()) ||
           this.selectedApplicants?.length && this.user.isCustomer() ||
           this.form.get('shipmentDateFrom').value ||
           this.form.get('shipmentDateTo').value;
  }

  getGroupsInfo(groups): string {
    if (groups?.length > 1) {
      return `Состоит в ${this.pluralize.transform(groups.length, "группе", "группах", "группах")}`;
    } else {
      return groups?.length ? groups[0].name : '—';
    }
  }

  trackByRequestId = (request: DashboardAvailableFiltersRequestItem) => request.id;
  trackByCustomerId = (customer: DashboardAvailableFiltersRequestItem) => customer.id;
  trackByResponsibleUserId = (user: DashboardAvailableFiltersRequestItem) => user.id;
  trackByApplicantId = (applicant: DashboardAvailableFiltersRequestItem) => applicant.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
