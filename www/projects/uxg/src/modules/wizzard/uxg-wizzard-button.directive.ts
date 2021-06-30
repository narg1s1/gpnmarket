import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { UxgWizzardDirective } from "./uxg-wizzard.directive";

@Directive({ selector: '[uxgWizzardButton]' })
export class UxgWizzardButtonDirective {
  @Input() uxgWizzardButton: "end" | "prev" | "next" | "cancel";

  constructor(private host: UxgWizzardDirective) {}

  @HostBinding('disabled') get disabled() {
    return ["end", "next"].indexOf(this.uxgWizzardButton) < 0 ? false : this.host.uxgWizzard.isCurrentInvalid;
  }

  @HostBinding('class.app-wizzard-button-hidden') get hidden() {
    switch (this.uxgWizzardButton) {
      case "cancel": return !this.host.uxgWizzard.isFirst;
      case "prev": return this.host.uxgWizzard.isFirst;
      case "next": return this.host.uxgWizzard.isLast;
      case "end": return !this.host.uxgWizzard.isLast;
    }
  }

  @HostListener('click') click() {
    switch (this.uxgWizzardButton) {
      case "cancel": this.host.cancel.emit(); break;
      case "prev": this.host.uxgWizzard.previous(); break;
      case "next": this.host.uxgWizzard.next(); break;
      case "end": this.host.end.emit(); break;
    }
  }
}
