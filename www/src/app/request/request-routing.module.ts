import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'approver', loadChildren: () => import('./approver/request-approver.module').then(m => m.RequestApproverModule) },
  { path: 'customer', loadChildren: () => import('./customer/request-customer.module').then(m => m.RequestCustomerModule) },
  { path: 'backoffice', loadChildren: () => import('./back-office/request-backoffice.module').then(m => m.RequestBackofficeModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule {
}
