import { Component, ElementRef, forwardRef, HostBinding, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'uxg-checkbox',
  templateUrl: 'uxg-checkbox.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UxgCheckboxComponent),
    multi: true
  }]
})

export class UxgCheckboxComponent implements ControlValueAccessor {
  public value: boolean;
  public onTouched: (value: boolean) => void;
  public onChange: (value: boolean) => void;
  @HostBinding('attr.disabled')
  @HostBinding('attr.readonly')
  @Input() disabled: boolean;
  @Input() readonly: boolean;

  @Input() isMixed: boolean;
  @Output() onChecked = new EventEmitter<boolean>();
  @ViewChild('checkbox') el: ElementRef;

  registerOnChange = (fn: any) => this.onChange = fn;
  registerOnTouched = (fn: any) => this.onTouched = fn;
  setDisabledState = (disabled: boolean) => this.disabled = disabled;
  setReadonlyState = (readonly: boolean) => this.readonly = readonly;
  writeValue = (value: boolean | null) => this.value = value;

  check(ev) {
    if (this.disabled) { return; }
    if (this.readonly) { return; }

    this.el.nativeElement.checked = !this.el.nativeElement.checked;
    ev.preventDefault();
    ev.stopPropagation();

    if (this.onChange) {
      this.onChange(this.el.nativeElement.checked);
    }
    this.writeValue(this.el.nativeElement.checked);
    this.onChecked?.emit(this.el.nativeElement.checked);
  }

  asHTMLInputElement(el) {
    return el as HTMLInputElement;
  }
}
