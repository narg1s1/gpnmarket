import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { AgreementsComponent } from './components/agreements/agreements.component';
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    AgreementsComponent,
  ],
  imports: [
    RouterModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AgreementsComponent,
  ]
})
export class AgreementsCommonModule {
}
