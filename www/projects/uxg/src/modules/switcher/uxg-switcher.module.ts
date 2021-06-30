import { NgModule } from '@angular/core';
import { UxgSwitcherComponent } from "./uxg-switcher.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [UxgSwitcherComponent],
  exports: [UxgSwitcherComponent],
})
export class UxgSwitcherModule {
}
