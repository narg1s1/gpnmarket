import { NgModule } from '@angular/core';
import { UxgDropdownComponent } from "./uxg-dropdown.component";
import { UxgDropdownItemDirective } from "./uxg-dropdown-item.directive";
import { CommonModule } from "@angular/common";
import { UxgIconModule } from "../icon/uxg-icon.module";


@NgModule({
  imports: [CommonModule, UxgIconModule],
  declarations: [UxgDropdownComponent, UxgDropdownItemDirective],
  exports: [UxgDropdownComponent, UxgDropdownItemDirective],
})
export class UxgDropdownModule {
}
