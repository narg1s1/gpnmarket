import { Component, ElementRef, forwardRef, HostBinding, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'uxg-radio-item',
  templateUrl: 'uxg-radio-item.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UxgRadioItemComponent),
    multi: true
  }]
})

export class UxgRadioItemComponent implements ControlValueAccessor {
  @HostBinding('attr.disabled')
  @Input() disabled = false;
  @Input() value = null;
  @Input() name;
  @Input() formControlName;
  @Input() checked: boolean;
  @ViewChild('radio') el: ElementRef;
  public onTouched: (value) => void;
  public onChange: (value) => void;
  public mainValue;

  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  setDisabledState = disabled => this.disabled = disabled;
  writeValue = value => {
    this.mainValue = value;
  }

  select(e) {
    if (this.disabled !== false) { return; }
    if (!this.el.nativeElement.checked) {
      this.el.nativeElement.click();
    }
    e.preventDefault();
    e.stopPropagation();
    if (!this.el.nativeElement.checked) {
      this.writeValue(this.value);
    }
  }
}
