import { NgModule } from '@angular/core';
import { KimComponent } from "./components/kim/kim.component";
import { SharedModule } from "../../shared/shared.module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { KimCartService } from "../customer/services/kim-cart.service";

@NgModule({
  declarations: [
    KimComponent
  ],
  imports: [
    RouterModule.forChild([]),
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [
    KimCartService
  ],
  exports: [
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class KimCommonModule { }
