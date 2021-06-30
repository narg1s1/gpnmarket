import { Component } from '@angular/core';
import { CartStoreService } from "../../services/cart-store.service";
import { getCurrencySymbol } from "@angular/common";

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  getCurrencySymbol = getCurrencySymbol;

  constructor(
    public cartStore: CartStoreService,
  ) { }
}
