import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { RequestsFromSuppliersComponent } from './components/procedure/procedure-requests-from-suppliers/procedure-requests-from-suppliers.component';
import { NgModule } from '@angular/core';
import { RequestCommonModule } from "../common/request-common.module";
import { RequestBackofficeRoutingModule } from "./request-backoffice-routing.module";

import { DesignDocumentationService } from "./services/design-documentation.service";
import { CommercialProposalsService } from "./services/commercial-proposals.service";
import { ProcedureService } from "./services/procedure.service";
import { RequestComponent } from './components/request/request.component';
import { PositionComponent } from "./components/position/position.component";
import { RequestService } from "./services/request.service";
import { TechnicalProposalsService } from "./services/technical-proposals.service";
import { TechnicalProposalListComponent } from './components/proposal/technical-proposal-list/technical-proposal-list.component';
import { TechnicalProposalFormComponent } from './components/proposal/technical-proposal-form/technical-proposal-form.component';
import { ProposalFormManufacturingNameComponent } from './components/proposal/proposal-form-manufacturing-name/proposal-form-manufacturing-name.component';
import { TechnicalProposalComponent } from "./components/proposal/technical-proposal/technical-proposal.component";
import { PositionService } from "./services/position.service";
import { TechnicalCommercialProposalViewComponent } from './components/proposal/proposal-view/technical-commercial-proposal-view/technical-commercial-proposal-view.component';
import { ProposalFormComponent } from "./components/proposal/proposal-form/proposal-form.component";
import { TechnicalCommercialProposalService } from "./services/technical-commercial-proposal.service";
import { NgxsModule } from "@ngxs/store";
import { TechnicalCommercialProposalState } from "./states/technical-commercial-proposal.state";
import { ProposalComponent } from "./components/proposal/proposal/proposal.component";
import { ProposalParametersFormComponent } from './components/proposal/proposal-form/proposal-parameters-form/proposal-parameters-form.component';
import { RequestState } from "./states/request.state";
import { RequestListState } from "./states/request-list.state";
import { RequestListComponent } from './components/request-list/request-list.component';
import { CommercialProposalState } from "./states/commercial-proposal.state";
import { ProposalContragentFormComponent } from "./components/proposal/proposal-contragent-form/proposal-contragent-form.component";
import { ProcedureComponent } from './components/procedure/procedure/procedure.component';
import { ProcedureGridComponent } from './components/procedure/procedure-grid/procedure-grid.component';
import { CommercialProposalViewComponent } from "./components/proposal/proposal-view/commercial-proposal-view/commercial-proposal-view.component";
import { ProcedureProlongateComponent } from "./components/procedure/procedure-prolongate/procedure-prolongate.component";
import { TechnicalCommercialProposalGroupListComponent } from './components/proposal/proposal-group-list/technical-commercial-proposal-group-list/technical-commercial-proposal-group-list.component';
import { ContractFormComponent } from "./components/contract-form/contract-form.component";
import { ContractListComponent } from "./components/contract-list/contract-list.component";
import { ContractState } from "./states/contract.state";
import { ContractService } from "./services/contract.service";
import { CommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/commercial-proposal-group-list/commercial-proposal-group-list.component";
import { ProposalGroupFormComponent } from "./components/proposal/proposal-group-form/proposal-group-form.component";
import { ProposalGroupListComponent } from './components/proposal/proposal-group-list/proposal-group-list.component';
import { ProposalItemFormComponent } from './components/proposal/proposal-item-form/proposal-item-form.component';
import { TechnicalCommercialProposalGroupService } from "./services/technical-commercial-proposal-group.service";
import { ProposalViewComponent } from "./components/proposal/proposal-view/proposal-view.component";
import { CommercialProposalGroupService } from "./services/commercial-proposal-group.service";
import { CommercialProposalsDeprecatedService } from "./services/commercial-proposals-deprecated.service";
import { PluralizePipe } from "../../shared/pipes/pluralize-pipe";
import { BytesToSizePipe } from "../../shared/pipes/bytes-to-size-pipe";
import { DashboardBackofficeModule } from "../../dashboard/back-office/dashboard-backoffice.module";
import { RequestsFromSuppliersState } from './states/procedure-requests-from-suppliers.state';

@NgModule({
  declarations: [
    RequestComponent,
    PositionComponent,
    TechnicalProposalListComponent,
    TechnicalProposalFormComponent,
    ProposalFormManufacturingNameComponent,
    ProcedureProlongateComponent,
    TechnicalProposalComponent,
    CommercialProposalViewComponent,
    CommercialProposalGroupListComponent,
    ProposalGroupFormComponent,
    ProposalViewComponent,
    ProposalComponent,
    TechnicalCommercialProposalViewComponent,
    ProposalFormComponent,
    ProposalParametersFormComponent,
    RequestListComponent,
    ProposalContragentFormComponent,
    ProcedureComponent,
    ProcedureGridComponent,
    TechnicalCommercialProposalGroupListComponent,
    ContractFormComponent,
    ContractListComponent,
    ProposalGroupListComponent,
    ProposalItemFormComponent,
    RequestsFromSuppliersComponent
  ],
  imports: [
    RequestBackofficeRoutingModule,
    NgxsModule.forFeature([
      RequestState,
      RequestListState,
      TechnicalCommercialProposalState,
      CommercialProposalState,
      ContractState,
      RequestsFromSuppliersState
    ]),
    RequestCommonModule,
    DashboardBackofficeModule
  ],
  exports: [
    ProcedureProlongateComponent,
    ProposalComponent,
    RequestsFromSuppliersComponent,
    ProposalViewComponent,
    ProposalContragentFormComponent,
    ProposalItemFormComponent
  ],
  providers: [
    DesignDocumentationService,
    CommercialProposalsService,
    CommercialProposalsDeprecatedService,
    CommercialProposalGroupService,
    ProcedureService,
    RequestService,
    TechnicalProposalsService,
    PositionService,
    TechnicalCommercialProposalService,
    TechnicalCommercialProposalGroupService,
    ContractService,
    PluralizePipe,
    BytesToSizePipe
  ]
})
export class RequestBackofficeModule {
}
