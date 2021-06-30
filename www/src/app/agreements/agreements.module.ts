import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementsService } from "./customer/services/agreements.service";
import { SharedModule } from "../shared/shared.module";
import { RouterModule } from "@angular/router";
import { AgreementsCustomerModule } from "./customer/agreements-customer.module";
import { AgreementsRoutingModule } from "./agreements-routing.module";
import { AgreementsBackofficeModule } from "./back-office/agreements-backoffice.module";



@NgModule({
  providers: [AgreementsService],
  imports: [
    RouterModule,
    SharedModule,
    CommonModule,
    AgreementsCustomerModule,
    AgreementsBackofficeModule,
    AgreementsRoutingModule
  ],
})
export class AgreementsModule {
}
