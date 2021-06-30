import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RequestComponent as CustomerRequestComponent } from "./components/request/request.component";
import { DesignDocumentationListComponent } from "../common/components/design-documentation-list/design-documentation-list.component";
import { PositionComponent } from "./components/position/position.component";
import { TechnicalProposalListComponent } from "./components/proposal/technical-proposal-list/technical-proposal-list.component";
import { CommercialProposalViewComponent } from "./components/proposal/proposal-view/commercial-proposal-view/commercial-proposal-view.component";
import { CanActivateFeatureGuard } from "../../core/can-activate-feature.guard";

import { RequestFormComponent } from "./components/request-form/request-form.component";
import { TechnicalCommercialProposalViewComponent } from "./components/proposal/proposal-view/technical-commercial-proposal-view/technical-commercial-proposal-view.component";
import { RequestListComponent } from "./components/request-list/request-list.component";
import { Routes } from "../../core/models/routes";
import { TechnicalCommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/technical-commercial-proposal-group-list/technical-commercial-proposal-group-list.component";
import { ContractListComponent } from "./components/contract-list/contract-list.component";
import { CommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/commercial-proposal-group-list/commercial-proposal-group-list.component";

const routes: Routes = [
  {
    path: '',
    component: RequestListComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Заявки", feature: "customerRequest" },
  },
  {
    path: 'create',
    component: RequestFormComponent,
    data: { title: "Создание заявки вручную", feature: "createRequest" }
  },
  {
    path: ':id',
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "customerRequest" },
    children: [
      {
        path: '',
        component: CustomerRequestComponent,
        data: { hideTitle: true }
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
        path: 'commercial-proposals',
        component: CommercialProposalGroupListComponent,
        data: { title: "Коммерческие предложения"}
      },
      {
        path: 'commercial-proposals/:groupId',
        component: CommercialProposalViewComponent,
      },
      {
        path: 'offers-approve-groups',
        component: TechnicalCommercialProposalGroupListComponent,
        data: { title: "Технико-коммерческие предложения" },
      },
      {
        path: 'offers-approve-groups/:groupId',
        component: TechnicalCommercialProposalViewComponent,
        data: { title: "Страница предложений" },
      },
      {
        path: 'design-documentation',
        component: DesignDocumentationListComponent,
        data: { title: "Рабочая конструкторская документация" }
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
export class RequestCustomerRoutingModule {
}
