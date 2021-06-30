import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";
import { EmployeeListRequestPosition } from "../../../models/employee-list-request-position";

@Component({
  selector: 'app-employee-card-position-list',
  templateUrl: './employee-card-position-list.component.html',
  styleUrls: ['./employee-card-position-list.component.scss']
})
export class EmployeeCardPositionListComponent {

  @Input() positions: EmployeeListRequestPosition[];

  constructor(
    protected router: Router
  ) { }

  onRowClick(position: EmployeeListRequestPosition): void {
    this.router.navigateByUrl(`/requests/backoffice/${position.requestId}/${position.id}`);
  }

}
