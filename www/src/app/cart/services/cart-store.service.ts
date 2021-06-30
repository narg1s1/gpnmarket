import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../core/models/response.model';
import { CartItem } from "../models/cart-item";
import { CatalogPosition } from "../../catalog/models/catalog-position";

@Injectable({
  providedIn: 'root'
})
export class CartStoreService {

  public cartItems: CartItem[] = [];

  constructor(private api: HttpClient) {}

  protected static createItems(rawData: any): CartItem[] {
    const res = [];
    if (!rawData) {
      return res;
    }
    for (const rawItem of rawData) {
      res.push(new CartItem(rawItem));
    }
    return res;
  }

  async load(): Promise<CartItem[]> {
    const url = 'catalog/cart/list';
    const resp = await this.api.get<CartItem[]>(url).toPromise();
    this.cartItems = CartStoreService.createItems(resp);
    return this.cartItems;
  }

  getItems(): CartItem[] {
    return this.cartItems;
  }

  getCount(): number {
    return this.cartItems.length;
  }

  getSum(): number {
    let sum = 0;

    for (const item of this.cartItems) {
      sum += item.getSum();
    }

    return sum;
  }

  isCatalogPositionInCart(position: CatalogPosition): boolean {
    for (const cartItem of this.cartItems) {
      if (cartItem.catalogPosition.id === position.id) {
        return true;
      }
    }

    return false;
  }

  /**
   * Добавление позиции в корзину
   *
   * @param position Позиция
   * @param quantity Количество
   */
  async addItem(position: CatalogPosition, quantity: number = 1): Promise<boolean> {
    const url = 'catalog/cart/add-item';
    const params = {
      catalogPositionId: position.id,
      quantity: quantity
    };
    const resp = await this.api.post<Response<Object>>(url, params).toPromise();
    if (!resp) {
      return false;
    }
    this.cartItems.push(new CartItem({catalogPosition: position, quantity: quantity}));
    return true;
  }

  /**
   * Удаление позиции с сервера и из локального хранилища
   *
   * @param item Удаляемя позиция
   */
  async deleteItem(item: CartItem): Promise<boolean> {
    const url = 'catalog/cart/remove-item';
    const params = {
      catalogPositionId: item.catalogPosition.id
    };
    const resp = await this.api.post<Response<Object>>(url, params).toPromise();
    if (!resp) {
      return false;
    }
    this.cartItems = this.cartItems.filter(el => el !== item);
    return true;
  }

  /**
   * Обновление количества на сервере и в локальном хранилище
   *
   * @param item Обновляемая позиция
   * @param quantity Количество
   */
  async updateQuantity(item: CartItem, quantity: number): Promise<boolean> {
    const prevQuantityValue = item.quantity;
    item.quantity = quantity;
    const url = 'catalog/cart/edit-item-quantity';
    const params = {
      catalogPositionId: item.catalogPosition.id,
      quantity: quantity
    };
    const resp = await this.api.post<Response<Object>>(url, params).toPromise();
    if (!resp) {
      item.quantity = prevQuantityValue;
      return false;
    }
    return true;
  }

  /**
   * Очистка корзины
   */
  async clear(): Promise<boolean> {
    const url = 'catalog/cart/clear';
    const resp = await this.api.post<Response<Object>>(url, {}).toPromise();
    if (!resp) {
      return false;
    }
    this.cartItems = [];
    return true;
  }
}
