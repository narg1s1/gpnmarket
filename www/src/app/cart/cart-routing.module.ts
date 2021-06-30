import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from "./components/cart/cart.component";

const routes: Routes = [
  {
    path: '',
    component: CartComponent,
    data: { title: "Корзина" }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule {
}