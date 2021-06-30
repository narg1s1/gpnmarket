import { NgModule } from '@angular/core';
import { UxgWizzardDirective, UxgWizzardStepDirective } from "./uxg-wizzard.directive";
import { UxgWizzardButtonDirective } from "./uxg-wizzard-button.directive";
import { UxgWizzardStepsComponent } from "./uxg-wizzard-steps.component";
import { CommonModule } from "@angular/common";
import { UxgIconModule } from "../icon/uxg-icon.module";


@NgModule({
  imports: [CommonModule, UxgIconModule],
  declarations: [UxgWizzardDirective, UxgWizzardButtonDirective, UxgWizzardStepsComponent, UxgWizzardStepDirective],
  exports: [UxgWizzardDirective, UxgWizzardButtonDirective, UxgWizzardStepsComponent, UxgWizzardStepDirective],
})
export class UxgWizzardModule {
}
