import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {EmployeeInfo, EmployeeInfoBrief} from "../models/employee-info";
import {EmployeeItem} from "../models/employee-item";
import {Uuid} from "../../cart/models/uuid";
import { User } from "../../user/models/user";
import { CatalogPosition } from "../../catalog/models/catalog-position";
import { EmployeeSettings } from "../models/employee-settings";

@Injectable()
export class EmployeeService {

  loading = false;

  constructor(
    protected api: HttpClient
  ) {
  }

  getEmployeeList(type): Observable<EmployeeItem[]> {
    return this.api.post<EmployeeItem[]>(`employees`, {role: type});
  }

  getEmployeeInfo(id: Uuid): Observable<EmployeeInfo> {
    return this.api.get<EmployeeInfo>(`employees/${id}`);
  }

  createEmployee(employeeId: Uuid, employee: EmployeeInfoBrief) {
    return this.api.post<EmployeeInfoBrief>(`users/registration/customer`, {
      "joinContragent": {
        "id": employeeId
      },
      "username": employee.username,
      "firstName": employee.firstName,
      "lastName": employee.lastName,
      "middleName": employee.middleName,
      "phone": employee.phone,
      "position": employee.position
    });
  }

  registerEmployee(employee: EmployeeInfoBrief) {
    return this.api.post<EmployeeInfoBrief>(`users/registration/backoffice`, {
      "username": employee.username,
      "role": employee.role,
      "firstName": employee.firstName,
      "lastName": employee.lastName,
      "middleName": employee.middleName,
      "phone": employee.phone,
      "position": employee.position,
    });
  }

  editEmployee(employee: EmployeeInfoBrief, type: string) {
    return this.api.post<EmployeeInfoBrief>(`users/edit/${type}`, {
      userId: employee.id,
      ...employee
    });
  }

  getEmployeesList(contragentId: Uuid): Observable<EmployeeInfoBrief[]> {
    return this.api.post<EmployeeInfoBrief[]>(`users/employee-list`, {
      "contragentId": contragentId
    });
  }

  resendEmployeeActivationLink(employeeId: Uuid) {
    const url = `users/registration/resend-activation`;
    return this.api.post<null>(url, { userId: employeeId });
  }

  addContragentToUser(contragentId: Uuid, user: User) {
    const url = `users/add-contragent-to-user`;
    return this.api.post<EmployeeInfoBrief[]>(url, { userId: user.id, contragentId: contragentId });
  }

  getUserInfo(userId: Uuid) {
    return this.api.get<EmployeeSettings>(`users/settings/${userId}`);
  }
}
