import { NgModule } from '@angular/core';
import { UxgCodeComponent } from "./uxg-code.component";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgCodeComponent],
  exports: [UxgCodeComponent],
})
export class UxgCodeModule {
}
