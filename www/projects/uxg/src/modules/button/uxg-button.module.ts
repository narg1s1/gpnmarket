import { NgModule } from '@angular/core';
import { UxgButtonDirective } from "./uxg-button.directive";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgButtonDirective],
  exports: [UxgButtonDirective],
})
export class UxgButtonModule {
}
