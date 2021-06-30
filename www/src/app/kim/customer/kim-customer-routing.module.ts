import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PriceOrderListComponent } from "./components/price-order-list/price-order-list.component";
import { Routes } from "../../core/models/routes";
import { CartComponent } from "./components/cart/cart.component";
import { ItemsDictionaryComponent } from "./components/items-dictionary/items-dictionary.component";
import { ManualPriceOrderComponent } from "./components/manual-price-order/manual-price-order.component";
import { PriceOrderProposalViewComponent } from "./components/price-order-proposal-view/price-order-proposal-view.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "price-orders",
    pathMatch: 'full'
  },
  {
    path: "price-orders",
    component: PriceOrderListComponent,
    data: { title: "Мои ценовые запросы" }
  },
  {
    path: "price-orders/create",
    component: ManualPriceOrderComponent,
    data: { title: " Создание произвольного ценового запроса вручную" }
  },
  {
    path: "price-orders/:id",
    component: PriceOrderProposalViewComponent,
    data: { title: "Мои ценовые запросы" }
  },
  {
    path: "cart",
    component: CartComponent,
    data: { title: "Корзина торгового портала" }
  },
  {
    path: 'items-dictionary',
    component: ItemsDictionaryComponent,
    data: { hideTitle: true },
  },
  {
    path: 'items-dictionary/:query',
    component: ItemsDictionaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KimCustomerRoutingModule {
}
