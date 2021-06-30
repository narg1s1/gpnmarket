import { Component, forwardRef, Input } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from "@angular/forms";

@Component({
  selector: 'range-slider-control',
  templateUrl: 'range-slider.control.html',
  styleUrls: ['./range-slider.control.scss'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RangeSliderControlComponent), multi: true},
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RangeSliderControlComponent), multi: true}
  ]
})

export class RangeSliderControlComponent implements ControlValueAccessor, Validator {
  @Input() min: number;
  @Input() max: number;
  @Input() step = 1;

  public value: [number, number];
  public onTouched: (value: [number, number]) => void;
  public onChange: (value: [number, number]) => void;
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

  writeValue(value: [number, number] | null): void {
    if (this.value && this.value[0] !== value[0] && value[0] > value[1]) {
      value[1] = value[0];
    }

    if (this.value && this.value[1] !== value[1] && value[0] > value[1]) {
      value[0] = value[1];
    }

    this.value = value;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.min !== undefined && control.value[0] < this.min) {
      return {outOfRange: true};
    }

    if (this.max !== undefined && control.value[1] > this.max) {
      return {outOfRange: true};
    }

    return null;
  }
}
