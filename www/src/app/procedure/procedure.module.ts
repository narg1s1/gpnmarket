import { NgModule } from '@angular/core';
import { ProcedureRoutingModule } from "./procedure-routing.module";
import {ProcedureInfoComponent} from "./components/procedure-info/procedure-info.component";
import {ProcedureViewComponent} from "./containers/procedure-view/procedure-view.component";
import {ProceduresListViewComponent} from "./containers/procedures-list-view/procedures-list-view.component";
import {ProcedureService} from "../request/back-office/services/procedure.service";
import {SharedModule} from "../shared/shared.module";
import {DashboardBackofficeModule} from "../dashboard/back-office/dashboard-backoffice.module";
import {CommonModule} from "@angular/common";
import {RequestBackofficeModule} from "../request/back-office/request-backoffice.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TextMaskModule} from "angular2-text-mask";
import {NgxsModule} from "@ngxs/store";
import {RequestState} from "../request/back-office/states/request.state";
import {RequestListState} from "../request/back-office/states/request-list.state";
import {TechnicalCommercialProposalState} from "../request/back-office/states/technical-commercial-proposal.state";
import {CommercialProposalState} from "../request/back-office/states/commercial-proposal.state";
import {ContractState} from "../request/back-office/states/contract.state";
import {RequestsFromSuppliersState} from "../request/back-office/states/procedure-requests-from-suppliers.state";
import {RouterModule} from "@angular/router";
import {TechnicalCommercialProposalViewComponent} from "./containers/technical-commercial-proposal-view/technical-commercial-proposal-view.component";
import {ProcedureTabsComponent} from "./components/procedure-tabs/procedure-tabs.component";
import {ProcedureState} from "./states/procedure.state";
import {ProcedureProposalViewComponent} from "./components/proposal-view/procedure-proposal-view.component";
import {ProcedureGridComponent} from "./components/procedure-grid/procedure-grid.component";
import { FilterService } from '../core/services/filter.service';


@NgModule({
  declarations: [
    ProcedureInfoComponent,
    ProcedureViewComponent,
    ProceduresListViewComponent,
    TechnicalCommercialProposalViewComponent,
    ProcedureTabsComponent,
    ProcedureProposalViewComponent,
    ProcedureGridComponent
  ],
  imports: [
    RouterModule,
    ProcedureRoutingModule,
    SharedModule,
    CommonModule,
    DashboardBackofficeModule,
    RequestBackofficeModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,

    NgxsModule.forFeature([
      RequestState,
      RequestListState,
      TechnicalCommercialProposalState,
      CommercialProposalState,
      ContractState,
      RequestsFromSuppliersState,
      ProcedureState
    ]),
  ],
  providers: [
    ProcedureService,
    FilterService
  ]
})
export class ProcedureModule {
}
