import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ContractSignComponent } from "./components/contract-sign/contract-sign.component";


const routes: Routes = [
  {
    path: ':id',
    component: ContractSignComponent,
    data: { title: 'Запрос на подписание договора ЭЦП' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractSignRoutingModule { }
