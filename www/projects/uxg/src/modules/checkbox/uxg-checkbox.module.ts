import { NgModule } from '@angular/core';
import { UxgCheckboxComponent } from "./uxg-checkbox.component";
import { UxgSelectAllDirective } from "./uxg-select-all.directive";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [UxgCheckboxComponent, UxgSelectAllDirective],
  exports: [UxgCheckboxComponent, UxgSelectAllDirective],
})
export class UxgCheckboxModule {
}
