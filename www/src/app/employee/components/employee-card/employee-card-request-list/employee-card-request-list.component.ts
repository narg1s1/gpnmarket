import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeInfoRequestItem } from "../../../models/employee-info";
import { Router } from "@angular/router";
import { RequestListItem } from "../../../../request/common/models/requests-list/requests-list-item";
import { Uuid } from "../../../../cart/models/uuid";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { PermissionType } from "../../../../auth/enum/permission-type";

@Component({
  selector: 'app-employee-card-request-list',
  templateUrl: './employee-card-request-list.component.html',
  styleUrls: ['./employee-card-request-list.component.scss']
})
export class EmployeeCardRequestListComponent {

  @Input() requests: EmployeeInfoRequestItem[];
  @Output() setResponsibleUser = new EventEmitter<{ requestId: Uuid, userId: Uuid }>();
  responsibleModalPayload: RequestListItem;
  readonly permissionType = PermissionType;

  constructor(
    private router: Router,
    public user: UserInfoService
  ) {}

  calcPieChart(request: any): number {
    const completedItems =  (request.completedCount) / (request.positionCount) * 100;
    return (65 - (65 * (completedItems || 0)) / 100);
  }

  onRowClick(request: EmployeeInfoRequestItem): void {
    this.router.navigateByUrl(`/requests/backoffice/${request.request.id}`);
  }

}
