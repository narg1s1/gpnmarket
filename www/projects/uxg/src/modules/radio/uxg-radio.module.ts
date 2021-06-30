import { NgModule } from '@angular/core';
import { UxgRadioItemComponent } from "./uxg-radio-item.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [UxgRadioItemComponent],
  exports: [UxgRadioItemComponent],
})
export class UxgRadioModule {
}
