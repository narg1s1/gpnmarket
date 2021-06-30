import { NgModule } from '@angular/core';
import { UxgInputDirective } from "./uxg-input.directive";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgInputDirective],
  exports: [UxgInputDirective],
})
export class UxgInputModule {
}
