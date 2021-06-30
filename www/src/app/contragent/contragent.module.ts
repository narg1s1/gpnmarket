import { NgModule } from '@angular/core';
import { ContragentRoutingModule } from './contragent-routing.module';
import { CommonModule } from '@angular/common';
import { ContragentListComponent } from './components/contragent-list/contragent-list.component';
import { SharedModule } from "../shared/shared.module";
import { ContragentListViewComponent } from "./components/contragent-list-view/contragent-list-view.component";
import { ContragentInfoViewComponent } from "./components/contragent-info-view/contragent-info-view.component";
import { ContragentRegistrationComponent } from './components/contragent-registration/contragent-registration.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDadataModule } from "@kolkov/ngx-dadata";
import { EmployeeModule } from "../employee/employee.module";
import { TextMaskModule } from "angular2-text-mask";

@NgModule({
  imports: [
    FormsModule,
    NgxDadataModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    ContragentRoutingModule,
    EmployeeModule,
    TextMaskModule
  ],
  declarations: [
    ContragentListViewComponent,
    ContragentListComponent,
    ContragentInfoViewComponent,
    ContragentRegistrationComponent,
  ]
})
export class ContragentModule { }
