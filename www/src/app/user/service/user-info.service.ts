import { Injectable } from '@angular/core';
import { UserInfo } from "../models/user-info";
import { UserRole } from "../models/user-role";
import { Permission } from "../../auth/models/permission";
import { UsersGroup } from "../../core/models/users-group";

const USER_INFO_KEY = 'UserInfo';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  /**
   * В этом массиве храним мапинг полей пришедших с авторизации на беке
   * к полям в нашем объекте UserInfo
   */
  protected mapData = {
    id: 'id',
    contragentId: 'contragentId',
    contragent: 'contragent',
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
    middleName: 'middleName',

    isCustomer: 'isCustomer',
    isCustomerApprover: 'isCustomerApprover',
    isBackOffice: 'isBackOffice',
    isSupplier: 'isSupplier',
    isAdmin: 'isAdmin',

    isCustomerBuyer: 'isCustomerBuyer',

    isBackofficeBuyer: 'isBackofficeBuyer',
    isSeniorBackoffice: 'isSeniorBackoffice',
    isBackofficeObserver: 'isBackofficeObserver',

    isSystemAdmin: 'isSystemAdmin',

    isContragentCreator: 'isContragentCreator',

    permissions: 'permissions',

    groups: 'groups'
  };

  /* @TODO лучше если бэк будет присылать список ролей массивом */
  get roles(): UserRole[] {
    const roles: UserRole[] = [];
    if (this.getUserInfo()) {
      // Устанавливаем системные роли
      if (this.isBackOffice()) {
        roles.push(UserRole.BACKOFFICE);
      }

      if (this.isCustomer()) {
        roles.push(UserRole.CUSTOMER);
      }

      if (this.isSupplier()) {
        roles.push(UserRole.SUPPLIER);
      }

      if (this.isAdmin()) {
        roles.push(UserRole.ADMIN);
      }

      // Устанавливаем пользовательские роли
      // ВАЖНО! Новый функционал желательно не завязывать на польз. роли, а лучше использовать permissions
      if (this.isCustomerBuyer()) {
        roles.push(UserRole.CUSTOMER_BUYER);
      }

      if (this.isCustomerApprover()) {
        roles.push(UserRole.CUSTOMER_APPROVER);
      }

      if (this.isBackofficeBuyer()) {
        roles.push(UserRole.BACKOFFICE_BUYER);
      }

      if (this.isSeniorBackoffice()) {
        roles.push(UserRole.SENIOR_BACKOFFICE);
      }

      if (this.isBackofficeObserver()) {
        roles.push(UserRole.BACKOFFICE_OBSERVER);
      }

      if (this.isSystemAdmin()) {
        roles.push(UserRole.SYSTEM_ADMIN);
      }

      if (this.isContragentCreator()) {
        roles.push(UserRole.CONTRAGENT_CREATOR);
      }
    }

    return roles;
  }

  public saveData(data: any): void {
    const userInfo = new UserInfo();

    for (const key of Object.keys(data)) {
      if (this.mapData[key]) {
        userInfo[this.mapData[key]] = data[key];
      }
    }

    this.getStorage().setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  }

  public clearData(): void {
    this.getStorage().setItem(USER_INFO_KEY, null);
  }

  public getUserInfo(): UserInfo {
    return JSON.parse(this.getStorage().getItem(USER_INFO_KEY));
  }

  public getShortUserFio(): string {
    if (!this.getUserInfo()) {
      return '';
    }
    return this.getUserInfo().firstName + ' ' + this.getUserInfo().lastName;
  }

  public getPermissions(): Permission[] {
    if (!this.getUserInfo()) {
      return [];
    }
    return this.getUserInfo().permissions;
  }

  public hasPermission(permissionType: string): boolean {
    for (const permission of this.getPermissions()) {
      if (permission.permission === permissionType) {
        return true;
      }
    }

    return false;
  }

  public getGroups(): UsersGroup[] {
    if (!this.getUserInfo()) {
      return [];
    }
    return this.getUserInfo().groups;
  }

  public isInGroup(groupId: string): boolean {
    for (const group of this.getGroups()) {
      if (group.id === groupId) {
        return true;
      }
    }

    return false;
  }

  public isAuth(): boolean {
    if (this.getUserInfo()) {
      return true;
    }
    return false;
  }

  public isCustomer(): boolean {
    return this.getUserInfo()?.isCustomer;
  }

  public isBackOffice(): boolean {
    return this.getUserInfo()?.isBackOffice;
  }

  public isSupplier(): boolean {
    return this.getUserInfo()?.isSupplier;
  }

  public isAdmin(): boolean {
    return this.getUserInfo()?.isAdmin;
  }

  public isCustomerBuyer(): boolean {
    return this.getUserInfo()?.isCustomerBuyer;
  }

  public isCustomerApprover(): boolean {
    return this.getUserInfo()?.isCustomerApprover;
  }

  public isBackofficeBuyer(): boolean {
    return this.getUserInfo()?.isBackofficeBuyer;
  }

  public isSeniorBackoffice(): boolean {
    return this.getUserInfo()?.isSeniorBackoffice;
  }

  public isBackofficeObserver(): boolean {
    return this.getUserInfo()?.isBackofficeObserver;
  }

  public isSystemAdmin(): boolean {
    return this.getUserInfo()?.isSystemAdmin;
  }

  public isContragentCreator(): boolean {
    return this.getUserInfo()?.isContragentCreator;
  }

  public getUserRole(): 'customer' | 'backoffice' {
    return this.isCustomer() || this.isCustomerApprover() ? 'customer' : 'backoffice';
  }

  public getContragentId(): string | null {
    return this.getUserInfo()?.contragentId;
  }

  private getStorage() {
    return window.localStorage;
  }
}
