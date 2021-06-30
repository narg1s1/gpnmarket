import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { ReplaySubject } from "rxjs";

@Component({
  selector: 'uxg-tab-title',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UxgTabTitleComponent {

  @HostBinding('class.app-tabs-item') appTabsItem = true;
  @HostBinding('class.app-tabs-item-active')
  @Input() active = false;
  @Input() id: string | number; // you can attach any id to your tab title
  @HostBinding('attr.disabled')
  @Input() set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.disabledChanges.next(disabled);
  }
  @Output() toggle = new EventEmitter<boolean>();
  get disabled() { return this._disabled; }
  private _disabled = false;
  public disabledChanges = new ReplaySubject<boolean>();

  get right(): number {
    const el = this.el.nativeElement;
    return el.parentElement.offsetWidth - el.offsetWidth - this.left;
  }

  get left(): number {
    return this.el.nativeElement.offsetLeft;
  }

  constructor(public el: ElementRef) {}

  @HostListener("click")
  activate() {
    if (!this.active && this._disabled === false) {
      this.active = true;
      this.toggle.emit(true);
    }
  }

  deactivate() {
    if (this.active) {
      this.active = false;
      this.toggle.emit(false);
    }
  }
}
