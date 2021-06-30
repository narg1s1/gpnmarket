import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {CanActivateFeatureGuard} from "../core/can-activate-feature.guard";
import {ProceduresListViewComponent} from "./containers/procedures-list-view/procedures-list-view.component";
import {ProcedureViewComponent} from "./containers/procedure-view/procedure-view.component";
import {TechnicalCommercialProposalViewComponent} from "./containers/technical-commercial-proposal-view/technical-commercial-proposal-view.component";

const routes: Routes = [
  {
    path: '',
    component: ProceduresListViewComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Созданные процедуры", feature: "proceduresList" }
  },
  {
    path: 'requests',
    component: ProceduresListViewComponent,
    data: { title: "Созданные процедуры", feature: "proceduresList" },
  },
  {
    path: ':id',
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "proceduresList" },
    children: [
      {
        path: 'info',
        component: ProcedureViewComponent,
      },
      {
        path: 'technical-commercial-proposals',
        component: TechnicalCommercialProposalViewComponent,
      },
      {
        path: 'technical-commercial-proposals/group/:groupId',
        component: TechnicalCommercialProposalViewComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcedureRoutingModule {
}
