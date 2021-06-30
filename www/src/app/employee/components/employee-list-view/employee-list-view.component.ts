import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmployeeService } from "../../services/employee.service";
import { EmployeeItem } from "../../models/employee-item";
import { UserInfoService } from "../../../user/service/user-info.service";
import { Router } from "@angular/router";
import { ToastActions } from "../../../shared/actions/toast.actions";
import { Observable, Subscription } from "rxjs";
import { Store } from "@ngxs/store";
import { EmployeeInfoBrief } from "../../models/employee-info";
import { Uuid } from "../../../cart/models/uuid";
import { EmployeeSettings } from "../../models/employee-settings";
import { shareReplay } from "rxjs/operators";

@Component({
  selector: 'app-employee-list-view',
  templateUrl: './employee-list-view.component.html'
})
export class EmployeeListViewComponent implements OnInit, OnDestroy {

  subscription = new Subscription();

  backoffice: EmployeeItem[] = [];
  seniorBackoffice: EmployeeItem[] = [];

  employeeActiveTabType = 'BACKOFFICE_BUYER';
  editedEmployee: EmployeeInfoBrief;

  userInfo$: Observable<EmployeeSettings>;

  constructor(
    protected employeeService: EmployeeService,
    public userInfoService: UserInfoService,
    public router: Router,
    private store: Store
  ) { }

  ngOnInit() {
    this.getEmployeeList('BACKOFFICE');
    this.getEmployeeList('SENIOR_BACKOFFICE');
  }

  getEmployeeList(type) {
    const subscription = this.employeeService.getEmployeeList(type).subscribe((employee) => {
      (type === 'BACKOFFICE') ?
        this.backoffice = employee :
        this.seniorBackoffice = employee;
      subscription.unsubscribe();
    });
  }

  getUserInfo(userId: Uuid) {
    this.userInfo$ = this.employeeService.getUserInfo(userId).pipe(shareReplay(1));
  }

  addEmployee(employee: EmployeeInfoBrief) {
    this.subscription.add(this.employeeService.registerEmployee(employee).subscribe(
      (data: EmployeeInfoBrief) => {
        const preparedData = { user: data, posCount: 0, reqCount: 0 };

        if (employee.role === 'BACKOFFICE_BUYER') {
          this.backoffice.push(preparedData);
        } else if (employee.role === 'SENIOR_BACKOFFICE') {
          this.seniorBackoffice.push(preparedData);
        }

        this.store.dispatch(new ToastActions.Success("Сотрудник успешно создан!"));
      },
      (err) => {
        this.store.dispatch(new ToastActions.Error('Ошибка создания! ' + err.error.detail));
      }));
  }

  updateEmployeeListItem(employee: EmployeeInfoBrief) {
    this.editedEmployee = null;

    this.subscription.add(this.employeeService.editEmployee(employee, 'backoffice').subscribe(
      (data) => {
        const newEmployeeType = data.roles[0].role;
        const backofficeListIndex = this.backoffice.findIndex(employeeItem => employeeItem.user.id === data.id);
        const seniorBackofficeListIndex = this.seniorBackoffice.findIndex(employeeItem => employeeItem.user.id === data.id);

        // todo Переосмыслить этот кусок после реализации передачи типа сотрудника на бэке
        if (backofficeListIndex !== -1) {
          if (newEmployeeType === 'BACKOFFICE_BUYER') {
            this.backoffice[backofficeListIndex].user = data;
          } else if (newEmployeeType === 'SENIOR_BACKOFFICE') {
            this.seniorBackoffice[this.seniorBackoffice.push(this.backoffice[backofficeListIndex]) - 1].user = data;
            this.backoffice.splice(backofficeListIndex, 1);
          }
        } else if (seniorBackofficeListIndex !== -1) {
          if (newEmployeeType === 'BACKOFFICE_BUYER') {
            this.backoffice[this.backoffice.push(this.seniorBackoffice[seniorBackofficeListIndex]) - 1].user = data;
            this.seniorBackoffice.splice(seniorBackofficeListIndex, 1);
          } else if (employee.role === 'SENIOR_BACKOFFICE') {
            this.seniorBackoffice[seniorBackofficeListIndex].user = data;
          }
        }

        this.store.dispatch(new ToastActions.Success("Сотрудник успешно отредактирован!"));
      },
      (err) => {
        this.store.dispatch(new ToastActions.Error('Ошибка редактирования! ' + err.error.detail));
      }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
