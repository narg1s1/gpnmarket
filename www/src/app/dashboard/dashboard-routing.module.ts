import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

const routes: Routes = [
  { path: 'customer', loadChildren: () => import('./customer/dashboard-customer.module').then(m => m.DashboardCustomerModule) },
  { path: 'backoffice', loadChildren: () => import('./back-office/dashboard-backoffice.module').then(m => m.DashboardBackofficeModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
