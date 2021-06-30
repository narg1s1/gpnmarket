import { NgModule } from '@angular/core';
import { UxgTabDirective } from "./uxg-tab.directive";
import { UxgTabTitleComponent } from "./uxg-tab-title.component";
import { UxgTabsComponent } from "./uxg-tabs.component";
import { CommonModule } from "@angular/common";
import { UxgIconModule } from "../icon/uxg-icon.module";


@NgModule({
  imports: [CommonModule, UxgIconModule],
  declarations: [UxgTabsComponent, UxgTabDirective, UxgTabTitleComponent],
  exports: [UxgTabsComponent, UxgTabDirective, UxgTabTitleComponent],
})
export class UxgTabModule {
}
