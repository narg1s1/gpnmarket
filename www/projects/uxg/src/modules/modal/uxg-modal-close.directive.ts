import { Directive, HostListener } from '@angular/core';
import { UxgModalComponent } from "./uxg-modal.component";

@Directive({ selector: '[uxgModalClose]' })
export class UxgModalCloseDirective {
  constructor(private host: UxgModalComponent) {}

  @HostListener('click')
  close() {
    this.host.close();
  }
}
