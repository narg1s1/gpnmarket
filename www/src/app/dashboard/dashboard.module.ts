import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { SharedModule } from "../shared/shared.module";
import { AgreementsCommonModule } from "../agreements/common/agreements-common.module";
import { AgreementsService } from "../agreements/customer/services/agreements.service";

@NgModule({
  declarations: [
  ],
  imports: [
    AgreementsCommonModule,
    SharedModule,
    CommonModule,
    DashboardRoutingModule
  ],
  providers: [
    AgreementsService
  ],
})
export class DashboardModule {
}
