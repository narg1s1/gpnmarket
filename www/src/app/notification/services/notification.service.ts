import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { NotificationsResponse } from "../models/notifications-response";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private api: HttpClient) {}

  getNotifications(startFrom: number = 0, pageSize: number = 20): Observable<NotificationsResponse> {
    const url = `requests/customer/notifications`;
    return this.api.post<NotificationsResponse>(url, {startFrom, pageSize});
  }

  getDashboardNotifications(): Observable<NotificationsResponse> {
    const url = `requests/customer/dashboard/notifications`;
    return this.api.post<NotificationsResponse>(url, null);
  }
}
