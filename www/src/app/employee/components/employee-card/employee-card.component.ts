import { Component, Input, OnInit } from '@angular/core';
import { EmployeeService } from "../../services/employee.service";
import { EmployeeInfo, EmployeeInfoBrief, EmployeeInfoRequestItem } from "../../models/employee-info";
import { UxgBreadcrumbsService } from "uxg";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Uuid } from "../../../cart/models/uuid";
import { EmployeeListRequestPosition } from "../../models/employee-list-request-position";
import { ToastActions } from "../../../shared/actions/toast.actions";
import { Store } from "@ngxs/store";
import { RequestService } from "../../../request/back-office/services/request.service";

@Component({
  selector: 'app-employee-card',
  templateUrl: './employee-card.component.html',
  styleUrls: ['./employee-card.component.scss']
})
export class EmployeeCardComponent implements OnInit {

  @Input() employeeCardInfo: EmployeeInfo;
  employeeId: Uuid;

  employee: EmployeeInfoBrief;
  sendingActivationLink = false;

  requestList: EmployeeInfoRequestItem[];
  responsibleRequestList: EmployeeInfoRequestItem[];
  positionsList: EmployeeListRequestPosition[];

  requestCount: number;
  positionCount: number;

  constructor(
    private bc: UxgBreadcrumbsService,
    private title: Title,
    private route: ActivatedRoute,
    protected employeeService: EmployeeService,
    private store: Store,
    private requestService: RequestService
  ) { }

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.getEmployeeInfo(this.employeeId);
  }

  getEmployeeInfo(id: Uuid): void {
    const subscription = this.employeeService.getEmployeeInfo(id).subscribe(employeeInfo => {
      this.requestList = employeeInfo.requestsWithResponsiblePositions;
      this.responsibleRequestList = employeeInfo.responsibleRequests;
      this.positionsList = employeeInfo.positions;
      this.employee = employeeInfo.user;

      this.bc.breadcrumbs = [
        { label: "Сотрудники", link: "/employees" },
        { label: employeeInfo.user.fullName, link: `/employees/${employeeInfo.user.id}/info` }
      ];

      this.requestCount = this.requestList ? (this.requestList.length || 0) : null;
      this.positionCount = this.positionsList ? this.positionsList.length : 0;

      subscription.unsubscribe();
    });
  }

  resendActivationLink(userId): void {
    this.sendingActivationLink = true;

    const subscription = this.employeeService.resendEmployeeActivationLink(userId).subscribe(
      () => {
        this.store.dispatch(new ToastActions.Success("Ссылка на активацию повторно отправлена пользователю"));
        this.sendingActivationLink = false;
        subscription.unsubscribe();
      },
      () => {
        this.store.dispatch(new ToastActions.Error("Не удалось повторно отправить ссылку на активацию"));
        this.sendingActivationLink = false;
        subscription.unsubscribe();
      }
    );
  }

  setResponsibleUser(requestId: Uuid, userId: Uuid ) {
    this.requestService.changeResponsibleUser(requestId, userId)
      .subscribe(() => this.getEmployeeInfo(this.employeeId));
  }
}
