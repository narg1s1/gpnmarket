import { NgModule } from '@angular/core';
import { RequestCommonModule } from "../common/request-common.module";
import { RequestComponent } from './components/request/request.component';
import { RequestCustomerRoutingModule } from "./request-customer-routing.module";
import { RequestService } from "./services/request.service";
import { TechnicalProposalsService } from "./services/technical-proposals.service";
import { PositionComponent } from "./components/position/position.component";
import { RequestTechnicalProposalComponent } from './components/proposal/technical-proposal-list/technical-proposal/technical-proposal.component';
import { TechnicalProposalListComponent } from './components/proposal/technical-proposal-list/technical-proposal-list.component';
import { CommercialProposalViewComponent } from './components/proposal/proposal-view/commercial-proposal-view/commercial-proposal-view.component';
import { AgreementsModule } from "../../agreements/agreements.module";
import { TechnicalCommercialProposalViewComponent } from './components/proposal/proposal-view/technical-commercial-proposal-view/technical-commercial-proposal-view.component';
import { TechnicalCommercialProposalService } from "./services/technical-commercial-proposal.service";
import { NgxsModule } from "@ngxs/store";
import { TechnicalCommercialProposalState } from "./states/technical-commercial-proposal.state";
import { ProposalComponent } from "./components/proposal/proposal/proposal.component";
import { RequestFormComponent } from "./components/request-form/request-form.component";
import { RequestFormFreeComponent } from "./components/request-form-free/request-form-free.component";
import { RequestState } from "./states/request.state";
import { RequestListComponent } from "./components/request-list/request-list.component";
import { RequestListState } from "./states/request-list.state";
import { TechnicalProposalState } from "./states/technical-proposal.state";
import { CommercialProposalState } from "./states/commercial-proposal.state";
import { TechnicalCommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/technical-commercial-proposal-group-list/technical-commercial-proposal-group-list.component";
import { ContractListComponent } from "./components/contract-list/contract-list.component";
import { ContractState } from "./states/contract.state";
import { ContractService } from "./services/contract.service";
import { ProposalConfirmComponent } from './components/proposal/proposal-confirm/proposal-confirm.component';
import { CommercialProposalGroupListComponent } from "./components/proposal/proposal-group-list/commercial-proposal-group-list/commercial-proposal-group-list.component";
import { ProposalGroupListComponent } from "./components/proposal/proposal-group-list/proposal-group-list.component";
import { ProposalViewComponent } from "./components/proposal/proposal-view/proposal-view.component";
import { CommercialProposalsService } from "./services/commercial-proposals.service";
import { PluralizePipe } from "../../shared/pipes/pluralize-pipe";
import { BytesToSizePipe } from "../../shared/pipes/bytes-to-size-pipe";

@NgModule({
  declarations: [
    RequestComponent,
    RequestFormComponent,
    RequestFormFreeComponent,
    PositionComponent,
    RequestTechnicalProposalComponent,
    TechnicalProposalListComponent,
    CommercialProposalViewComponent,
    CommercialProposalGroupListComponent,
    TechnicalCommercialProposalViewComponent,
    ProposalComponent,
    RequestListComponent,
    TechnicalCommercialProposalGroupListComponent,
    ProposalConfirmComponent,
    ContractListComponent,
    ProposalGroupListComponent,
    ProposalViewComponent,
  ],
  imports: [
    AgreementsModule,
    RequestCustomerRoutingModule,
    RequestCommonModule,
    NgxsModule.forFeature([
      RequestState,
      RequestListState,
      TechnicalCommercialProposalState,
      TechnicalProposalState,
      CommercialProposalState,
      ContractState
    ]),
  ],
  providers: [
    RequestService,
    TechnicalProposalsService,
    CommercialProposalsService,
    TechnicalCommercialProposalService,
    ContractService,
    PluralizePipe,
    BytesToSizePipe
  ]
})
export class RequestCustomerModule {
}
