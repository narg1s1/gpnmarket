import { RouterModule, Routes } from "@angular/router";
import { CanActivateFeatureGuard } from "../../core/can-activate-feature.guard";
import { NgModule } from "@angular/core";
import { DashboardComponent as CustomerDashboardComponent } from "./components/dashboard/dashboard.component";

const routes: Routes = [
  {
    path: '',
    component: CustomerDashboardComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Главная", hideTitle: true, feature: "customerDashboard" }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardCustomerRoutingModule {
}
