import { NgModule } from '@angular/core';
import { NgxsModule } from "@ngxs/store";
import { PriceOrderState } from "./states/price-order.state";
import { KimCommonModule } from "../common/kim-common.module";
import { PriceOrderFormComponent } from "./components/price-order-form/price-order-form.component";
import { PriceOrderListComponent } from "./components/price-order-list/price-order-list.component";
import { CartComponent } from "./components/cart/cart.component";
import { CatalogComponent } from "./components/catalog/catalog.component";
import { KimPriceOrderService } from "./services/kim-price-order.service";
import { KimCustomerRoutingModule } from "./kim-customer-routing.module";
import { PriceOrderFormPositionsComponent } from './components/price-order-form/form-positions/form-positions.component';
import { PriceOrderFormPositionsParamsComponent } from './components/price-order-form/form-positions-params/form-positions-params.component';
import { TextMaskModule } from "angular2-text-mask";
import { ItemsDictionaryComponent } from './components/items-dictionary/items-dictionary.component';
import { ItemsDictionaryState } from "./states/items-dictionary.state";
import { KimItemsDictionaryService } from "./services/kim-items-dictionary.service";
import { KimCartService } from "./services/kim-cart.service";
import { CartState } from "./states/cart.state";
import { ManualPriceOrderComponent } from './components/manual-price-order/manual-price-order.component';
import { PriceOrderProposalViewComponent } from './components/price-order-proposal-view/price-order-proposal-view.component';
import { PriceOrderProposalsState } from "./states/price-order-proposals.state";
import { PriceOrderProposalDetailComponent } from "./components/price-order-proposal-detail/price-order-proposal-detail.component";


@NgModule({
  declarations: [
    PriceOrderFormComponent,
    PriceOrderListComponent,
    CartComponent,
    CatalogComponent,
    PriceOrderFormPositionsComponent,
    PriceOrderFormPositionsParamsComponent,
    ItemsDictionaryComponent,
    ManualPriceOrderComponent,
    PriceOrderProposalViewComponent,
    PriceOrderProposalDetailComponent
  ],
  providers: [
    KimPriceOrderService,
    KimItemsDictionaryService,
    KimCartService
  ],
  imports: [
    KimCommonModule,
    KimCustomerRoutingModule,
    NgxsModule.forFeature([
      PriceOrderState,
      PriceOrderProposalsState,
      ItemsDictionaryState,
      CartState
    ]),
    TextMaskModule
  ]
})
export class KimCustomerModule { }
