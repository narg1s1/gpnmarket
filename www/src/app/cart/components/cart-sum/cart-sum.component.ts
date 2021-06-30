import { Component, OnInit } from '@angular/core';
import { CartStoreService } from "../../services/cart-store.service";

@Component({
  selector: 'cart-sum',
  templateUrl: './cart-sum.component.html',
  styleUrls: ['./cart-sum.component.css']
})
export class CartSumComponent implements OnInit {

  constructor(
    protected cartStore: CartStoreService
  ) { }

  ngOnInit() {
  }

  getSum(): number {
    return this.cartStore.getSum();
  }
}
