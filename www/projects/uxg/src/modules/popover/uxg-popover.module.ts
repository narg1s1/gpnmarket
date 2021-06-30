import { NgModule } from '@angular/core';
import { UxgPopoverComponent } from "./uxg-popover.component";
import { UxgPopoverContentDirective } from "./uxg-popover-content.directive";
import { UxgPopoverTriggerDirective } from "./uxg-popover-trigger.directive";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgPopoverComponent, UxgPopoverContentDirective, UxgPopoverTriggerDirective],
  exports: [UxgPopoverComponent, UxgPopoverContentDirective, UxgPopoverTriggerDirective],
})
export class UxgPopoverModule {
}
