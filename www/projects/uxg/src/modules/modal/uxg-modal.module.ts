import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UxgModalComponent } from './uxg-modal.component';
import { UxgModalFooterDirective } from './uxg-modal-footer.directive';
import { UxgIconModule } from "../../modules/icon/uxg-icon.module";
import { UxgModalCloseDirective } from "./uxg-modal-close.directive";


@NgModule({
  imports: [
    CommonModule,
    UxgIconModule
  ],
  declarations: [UxgModalComponent, UxgModalFooterDirective, UxgModalCloseDirective],
  exports: [UxgModalComponent, UxgModalFooterDirective, UxgModalCloseDirective]
})
export class UxgModalModule {
}
