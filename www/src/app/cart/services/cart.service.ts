import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderFormInfo } from '../models/order-form-info';
import {Observable} from "rxjs";
import { Uuid } from "../models/uuid";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    protected api: HttpClient
  ) { }

  /**
   * Отправка заказа
   *
   * @param orderFormInfo Значения из формы оформления заказа в корзине
   */
  sendOrder(orderFormInfo: OrderFormInfo): Observable<{id: Uuid}> {
    const url = 'catalog/add-request-from-cart';
    return this.api.post<{id: Uuid}>(url, orderFormInfo);
  }
}
