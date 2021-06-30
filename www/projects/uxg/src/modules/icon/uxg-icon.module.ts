import { NgModule } from '@angular/core';
import { UxgIconDirective } from "./uxg-icon.directive";
import { CommonModule } from "@angular/common";
import { UxgIconService } from "./uxg-icon.service";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgIconDirective],
  providers: [UxgIconService],
  exports: [UxgIconDirective],
})
export class UxgIconModule {
}
