import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input } from '@angular/core';
import { UxgDropdownItem } from "./uxg-dropdown-item";

@Directive({
  selector: '[uxgDropdownItem]'
})
export class UxgDropdownItemDirective {
  @HostBinding('class.app-dropdown-items-item') classItem = true;
  @HostBinding('class.focus') isFocus = false;
  @Input() disabled = false;
  @Input() value = null;

  onSelect = new EventEmitter<UxgDropdownItem>();
  onFocus = new EventEmitter<UxgDropdownItem>();

  constructor(private el: ElementRef, private cd: ChangeDetectorRef) {}

  focus = () => {
    this.onFocus.emit();
    this.isFocus = true;
    this.cd.detectChanges();
  }

  blur = () => {
    this.isFocus = false;
    this.cd.detectChanges();
  }

  get label(): string | null {
    return this.el.nativeElement.innerText || null;
  }

  @HostListener('click')
  click() {
    if (this.disabled === false) {
      this.onSelect.emit({value: this.value, label: this.label});
    }
  }
}
