import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListViewComponent } from "./components/employee-list-view/employee-list-view.component";
import { EmployeeCardComponent } from "./components/employee-card/employee-card.component";
import { CanActivateFeatureGuard } from "../core/can-activate-feature.guard";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EmployeeListViewComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Сотрудники" }
  },
  {
    path: ':id',
    children: [
      {
        path: 'info',
        component: EmployeeCardComponent,
        canActivate: [CanActivateFeatureGuard],
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {
}
