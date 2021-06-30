import { UxgSuggestionsDirective } from './uxg-suggestions.directive';
import { NgModule } from '@angular/core';
import { UxgDropdownInputComponent } from "./uxg-dropdown-input.component";
import { UxgInputModule } from "../input/uxg-input.module";
import { CommonModule } from "@angular/common";
import { UxgIconModule } from "../icon/uxg-icon.module";


@NgModule({
  imports: [CommonModule, UxgInputModule, UxgIconModule],
  declarations: [UxgDropdownInputComponent, UxgSuggestionsDirective],
  exports: [UxgDropdownInputComponent, UxgSuggestionsDirective],
})
export class UxgDropdownInputModule {
}
