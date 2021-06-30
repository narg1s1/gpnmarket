import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { UxgDatepickerDirective } from "./uxg-datepicker.directive";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgDatepickerDirective],
  exports: [UxgDatepickerDirective],
})
export class UxgDatepickerModule {
}
