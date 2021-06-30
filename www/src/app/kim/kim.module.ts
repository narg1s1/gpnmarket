import { NgModule } from '@angular/core';
import { KimCommonModule } from "./common/kim-common.module";
import { Routes } from "../core/models/routes";
import { KimComponent } from "./common/components/kim/kim.component";
import { CanActivateFeatureGuard } from "../core/can-activate-feature.guard";
import { RouterModule } from "@angular/router";

const routes: Routes = [{
  path: "",
  component: KimComponent,
  canActivate: [CanActivateFeatureGuard],
  data: { feature: "kim" },
  children: [
    { path: '', redirectTo: "customer"},
    { path: 'customer', loadChildren: () => import('./customer/kim-customer.module').then(m => m.KimCustomerModule) },
  ]
}];

@NgModule({
  imports: [
    KimCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class KimModule { }
