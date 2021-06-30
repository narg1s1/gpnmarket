import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractSignRoutingModule } from "./contract-sign-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { ContractSignComponent } from "./components/contract-sign/contract-sign.component";
import { SharedModule } from "../shared/shared.module";
import { NgxsModule } from "@ngxs/store";
import { ContractSignState } from "./states/contract-sign.state";
import { ContractDocumentsListComponent } from './components/contract-documents-list/contract-documents-list.component';

@NgModule({
  declarations: [
    ContractSignComponent,
    ContractDocumentsListComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    ContractSignRoutingModule,
    NgxsModule.forFeature([
      ContractSignState
    ]),
  ]
})
export class ContractSignModule { }
