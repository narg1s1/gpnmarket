import { RouterModule, Routes } from "@angular/router";
import { CanActivateFeatureGuard } from "../../core/can-activate-feature.guard";
import { NgModule } from "@angular/core";
import { DashboardComponent as BackofficeDashboardComponent } from "./components/dashboard/dashboard.component";

const routes: Routes = [
  {
    path: '',
    component: BackofficeDashboardComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Главная", hideTitle: true, feature: "backofficeDashboard" },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardBackofficeRoutingModule {
}
