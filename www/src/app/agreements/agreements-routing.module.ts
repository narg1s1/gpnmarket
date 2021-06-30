import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgreementsComponent as CustomerAgreementsComponent } from "./customer/components/agreements/agreements.component";
import { AgreementsComponent as BackofficeAgreementsComponent } from "./back-office/components/agreements/agreements.component";

const routes: Routes = [
  {
    path: 'customer',
    component: CustomerAgreementsComponent,
    data: { title: "Согласования" }
  },
  {
    path: 'backoffice',
    component: BackofficeAgreementsComponent,
    data: { title: "Задачи" }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgreementsRoutingModule {
}
