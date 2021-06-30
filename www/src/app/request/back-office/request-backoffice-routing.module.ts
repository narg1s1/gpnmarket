import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestComponent } from "./components/request/request.component";
import { DesignDocumentationListComponent } from "../common/components/design-documentation-list/design-documentation-list.component";
import { PositionComponent } from "./components/position/position.component";
import { TechnicalProposalListComponent } from "./components/proposal/technical-proposal-list/technical-proposal-list.component";
import { CanActivateFeatureGuard } from "../../core/can-activate-feature.guard";
import { TechnicalCommercialProposalViewComponent } from "./components/proposal/proposal-view/technical-commercial-proposal-view/technical-commercial-proposal-view.component";
import { RequestListComponent } from "./components/request-list/request-list.component";
import { CommercialProposalViewComponent } from "./components/proposal/proposal-view/commercial-proposal-view/commercial-proposal-view.component";
import { TechnicalCommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/technical-commercial-proposal-group-list/technical-commercial-proposal-group-list.component";
import { ContractListComponent } from "./components/contract-list/contract-list.component";
import { CommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/commercial-proposal-group-list/commercial-proposal-group-list.component";
import { AppAuthGuard } from "../../auth/app-auth.guard";

const routes: Routes = [
  {
    path: '',
    component: RequestListComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Заявки", feature: "backofficeRequest" }
  },
  {
    path: ':id',
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "backofficeRequest" },
    children: [
      {
        path: '',
        component: RequestComponent,
        data: { hideTitle: true }
      },
      {
        path: 'commercial-proposals',
        component: CommercialProposalGroupListComponent,
        data: { title: "Коммерческие предложения" }
      },
      {
        path: 'commercial-proposals/:groupId',
        component: CommercialProposalViewComponent
      },
      {
        path: 'contracts',
        component: ContractListComponent,
        data: { title: "Согласование договора" }
      },
      {
        path: 'technical-proposals',
        component: TechnicalProposalListComponent,
        data: { title: "Технические предложения" }
      },
      {
        path: 'technical-commercial-proposals',
        component: TechnicalCommercialProposalGroupListComponent,
        data: { title: "Технико-коммерческие предложения" },
      },
      {
        path: 'technical-commercial-proposals/:groupId',
        component: TechnicalCommercialProposalViewComponent
      },
      {
        path: 'design-documentation',
        component: DesignDocumentationListComponent,
        data: { title: "Рабочая конструкторская документация" }
      },
      {
        path: 'element', canActivate: [AppAuthGuard, CanActivateFeatureGuard],
        data: { feature: 'normalization' },
        loadChildren: () => import('./element-lazy.module').then(m => m.ElementLazyModule)
      },
      {
        path: ':positionId',
        component: PositionComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestBackofficeRoutingModule {
}
