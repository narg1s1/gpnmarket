import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'checkbox-slider-control',
  templateUrl: 'checkbox-slider.control.html',
  styleUrls: ['./checkbox-slider.control.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxSliderControlComponent),
    multi: true
  }]
})

export class CheckboxSliderControlComponent implements ControlValueAccessor {
  public value: boolean;
  public onTouched: (value: boolean) => void;
  public onChange: (value: boolean) => void;
  public isDisabled: boolean;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: boolean | null): void {
    this.value = value;
  }
}
