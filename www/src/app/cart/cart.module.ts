import { NgModule } from '@angular/core';

import { CartComponent } from "./components/cart/cart.component";
import { CartItemsComponent } from './components/cart-items/cart-items.component';
import { WidgetComponent } from './widget/widget.component';
import { OrderComponent } from './components/order/order.component';
import { CartSumComponent } from './components/cart-sum/cart-sum.component';
import { SharedModule } from "../shared/shared.module";
import { CartRoutingModule } from "./cart-routing.module";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  imports: [
    SharedModule,
    CartRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
    WidgetComponent,
    CartItemsComponent
  ],
  declarations: [
    CartComponent,
    WidgetComponent,
    CartItemsComponent,
    OrderComponent,
    CartSumComponent
  ]
})
export class CartModule { }
