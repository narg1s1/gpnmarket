import { RouterModule, Routes } from "@angular/router";
import { CanActivateFeatureGuard } from "../../core/can-activate-feature.guard";
import { NgModule } from "@angular/core";
import { RequestListComponent } from "./components/request-list/request-list.component";
import { RequestComponent } from "./components/request/request.component";
import { PositionComponent } from "./components/position/position.component";

const routes: Routes = [
  {
    path: '',
    component: RequestListComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Согласование заявок", feature: "approverRequest" }
  },
  {
    path: ':id',
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "approverRequest" },
    children: [
      {
        path: '',
        component: RequestComponent,
        data: { hideTitle: true }
      },
      {
        path: ':positionId',
        component: PositionComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestApproverRoutingModule {
}
