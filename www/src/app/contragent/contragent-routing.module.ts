import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContragentListViewComponent } from "./components/contragent-list-view/contragent-list-view.component";
import { ContragentInfoViewComponent } from "./components/contragent-info-view/contragent-info-view.component";
import { ContragentRegistration } from "./models/contragent-registration";
import { ContragentRegistrationComponent } from "./components/contragent-registration/contragent-registration.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list',
  },
  {
    path: 'list',
    component: ContragentListViewComponent,
    data: { title: "Контрагенты", hideTitle: true }
  },
  {
    path: 'create',
    component: ContragentRegistrationComponent,
    data: { title: "Добавить нового контрагента" }
  },
  {
    path: ':id',
    children: [
      {
        path: 'info',
        component: ContragentInfoViewComponent
      },
      {
        path: 'edit',
        component: ContragentRegistrationComponent,
        data: { title: "Редактировать контрагента" }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContragentRoutingModule {
}
