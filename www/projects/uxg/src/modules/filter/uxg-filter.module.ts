import { UxgDropdownModule } from './../dropdown/uxg-dropdown.module';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { UxgFilterComponent } from "./uxg-filter.component";
import { UxgFilterButtonComponent } from "./filter-button/uxg-filter-button.component";
import { UxgFilterCheckboxListComponent } from "./filter-checkbox-list/uxg-filter-checkbox-list.component";
import { UxgFilterSectionComponent } from "./filter-section/uxg-filter-section.component";
import { UxgFilterDirective } from "./uxg-filter.directive";
import { UxgCheckboxModule } from "../checkbox/uxg-checkbox.module";
import { UxgIconModule } from "../icon/uxg-icon.module";
import { UxgButtonModule } from "../button/uxg-button.module";
import { UxgInputModule } from "../input/uxg-input.module";
import { UxgFilterMultiSelectListComponent } from './filter-multi-select-list/uxg-filter-multi-select-list.component';
import { UxgDropdownInputModule } from '../dropdown-input/uxg-dropdown-input.module';


@NgModule({
  imports: [CommonModule, UxgCheckboxModule, UxgIconModule, UxgButtonModule, ReactiveFormsModule, UxgInputModule, UxgDropdownModule, UxgDropdownInputModule],
  declarations: [
    UxgFilterComponent,
    UxgFilterDirective,
    UxgFilterButtonComponent,
    UxgFilterCheckboxListComponent,
    UxgFilterSectionComponent,
    UxgFilterMultiSelectListComponent,
  ],
  exports: [
    UxgFilterComponent,
    UxgFilterDirective,
    UxgFilterButtonComponent,
    UxgFilterCheckboxListComponent,
    UxgFilterSectionComponent,
    UxgFilterMultiSelectListComponent,
  ]
})
export class UxgFilterModule {
}
