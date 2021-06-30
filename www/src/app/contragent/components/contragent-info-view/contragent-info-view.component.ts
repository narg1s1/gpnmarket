import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {Uuid} from "../../../cart/models/uuid";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {ContragentInfo} from "../../models/contragent-info";
import {ContragentService} from "../../services/contragent.service";
import {Title} from "@angular/platform-browser";
import {map, shareReplay, tap} from "rxjs/operators";
import {UxgBreadcrumbsService} from "uxg";
import {EmployeeService} from "../../../employee/services/employee.service";
import {EmployeeInfoBrief} from "../../../employee/models/employee-info";
import {UserInfoService} from "../../../user/service/user-info.service";
import {Store} from "@ngxs/store";
import {ToastActions} from "../../../shared/actions/toast.actions";
import {User} from "../../../user/models/user";
import {UserService} from "../../../user/service/user.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { saveAs } from 'file-saver/src/FileSaver';
import { FeatureService } from "../../../core/services/feature.service";

@Component({
  selector: 'app-contragent-info-view',
  templateUrl: './contragent-info-view.component.html',
  styleUrls: ['./contragent-info-view.component.scss']
})
export class ContragentInfoViewComponent implements OnInit, OnDestroy {

  contragentId: Uuid;
  contragent$: Observable<ContragentInfo>;
  employeesList$: Observable<EmployeeInfoBrief[]>;
  customerBuyerUsersWithoutContragent$: Observable<User[]>;
  subscription = new Subscription();
  editedEmployee: EmployeeInfoBrief;
  downloading: boolean;

  form = new FormGroup({
    user: new FormControl(null, Validators.required)
  });

  constructor(
    private bc: UxgBreadcrumbsService,
    private cd: ChangeDetectorRef,
    private title: Title,
    private route: ActivatedRoute,
    public getContragentService: ContragentService,
    protected employeeService: EmployeeService,
    protected userService: UserService,
    public featureService: FeatureService,
    public user: UserInfoService,
    public router: Router,
    private store: Store
  ) {
  }

  ngOnInit() {
    this.contragentId = this.route.snapshot.paramMap.get('id');
    this.getContragentInfo(this.contragentId);
    this.getContragentEmployeesList(this.contragentId);
    this.getCustomerBuyerUsersWithoutContragent();
  }

  getContragentInfo(contragentId: Uuid): void {
    this.contragent$ = this.getContragentService.getContragentInfo(contragentId).pipe(
      tap(contragent => {
        this.title.setTitle(contragent.shortName);
        this.bc.breadcrumbs = [
          {label: "Контрагенты", link: "/contragents/list"},
          {label: this.title.getTitle(), link: `/contragents/${contragent.id}/info`}
        ];
      })
    );
  }

  getContragentEmployeesList(contragentId: Uuid): void {
    this.employeesList$ = this.employeeService.getEmployeesList(contragentId).pipe(shareReplay(1));
  }

  getCustomerBuyerUsersWithoutContragent(): void {
    this.customerBuyerUsersWithoutContragent$ = this.userService.getCustomerBuyerUsersWithoutContragent().pipe(shareReplay(1));
  }

  onDownloadPrimaInformReport(): void {
    this.downloading = true;

    this.getContragentService.downloadPrimaInformReport(this.contragentId).subscribe(data => {
      saveAs(data, `PrimaInformReport${this.contragentId}.pdf`);
      this.downloading = false;
      this.cd.detectChanges();
    }, (error: any) => {
      let msg = 'Ошибка при получении отчета';
      this.downloading = false;
      this.cd.detectChanges();
      if (error?.error?.detail) {
        msg = `${msg}: ${error.error.detail}`;
      }
      this.store.dispatch(new ToastActions.Error(msg));
    });
  }

  addEmployee(employee: EmployeeInfoBrief) {
    this.subscription.add(this.employeeService.createEmployee(this.contragentId, employee).subscribe(
      (data) => {
        this.employeesList$ = this.employeesList$.pipe(
          map(employeeList => [data, ...employeeList])
        );
        this.store.dispatch(new ToastActions.Success("Сотрудник успешно создан!"));
      },
      (err) => {
        this.store.dispatch(new ToastActions.Error('Ошибка создания! ' + err.error.detail));
      }));
  }

  updateEmployeeListItem(employee: EmployeeInfoBrief) {
    this.editedEmployee = null;
    this.subscription.add(this.employeeService.editEmployee(employee, 'customer').subscribe(
      (data) => {
        this.employeesList$ = this.employeesList$.pipe(
          map(employeeList => {
            const index = employeeList.findIndex(_employee => _employee.id === data.id);
            if (index !== -1) {
              employeeList[index] = data;
            }
            return employeeList;
          })
        );
        this.store.dispatch(new ToastActions.Success("Сотрудник успешно отредактирован!"));
      },
      (err) => {
        this.store.dispatch(new ToastActions.Error('Ошибка редактирования! ' + err.error.detail));
      }));
  }

  addContragentToUser() {
    this.subscription.add(this.employeeService.addContragentToUser(this.contragentId, this.form.get('user').value).subscribe(
      () => {
        this.getContragentEmployeesList(this.contragentId);
        this.getCustomerBuyerUsersWithoutContragent();
        this.store.dispatch(new ToastActions.Success("Сотрудник успешно привязан!"));
      },
      (err) => {
        this.store.dispatch(new ToastActions.Error('Ошибка привязки сотрудника! ' + err.error.detail));
      }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
