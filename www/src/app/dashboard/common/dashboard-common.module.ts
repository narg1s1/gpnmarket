import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAgreementsComponent } from './components/dashboard-agreements/dashboard-agreements.component';
import { SharedModule } from "../../shared/shared.module";
import { AgreementsCommonModule } from "../../agreements/common/agreements-common.module";
import { TasksBarComponent } from './components/tasks-bar/tasks-bar.component';
import { DashboardStatisticsComponent } from './components/dashboard-statistics/dashboard-statistics.component';
import { PercentageBarComponent } from './components/dashboard-statistics/percentage-bar/percentage-bar.component';
import { ReactiveFormsModule } from "@angular/forms";
import { DashboardCommonRoutingModule } from "./dashboard-common-routing.module";

@NgModule({
  declarations: [
    DashboardAgreementsComponent,
    DashboardStatisticsComponent,
    PercentageBarComponent,
    TasksBarComponent,
  ],
  imports: [
    AgreementsCommonModule,
    SharedModule,
    CommonModule,
    DashboardCommonRoutingModule,
    ReactiveFormsModule,
  ],
  exports: [
    DashboardAgreementsComponent,
    DashboardStatisticsComponent,
  ]
})
export class DashboardCommonModule {
}
