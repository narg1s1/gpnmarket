import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { KimPriceOrderPosition } from "../../../../common/models/kim-price-order-position";
import { Uuid } from "../../../../../cart/models/uuid";
import { Observable } from "rxjs";
import { Okpd2Item } from "../../../../../core/models/okpd2-item";
import { Okpd2Service } from "../../../../../shared/services/okpd2.service";

@Component({
  selector: 'app-kim-price-order-form-positions-params',
  templateUrl: './form-positions-params.component.html',
  styleUrls: ['./form-positions-params.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PriceOrderFormPositionsParamsComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderFormPositionsParamsComponent implements ControlValueAccessor, AfterViewInit {
  @Output() cancel = new EventEmitter();
  formArray: FormArray;
  value?: (KimPriceOrderPosition & {controlId: Uuid})[];
  onTouched: (value) => void;
  onChange: (value) => void;
  okpd2List$: Observable<Okpd2Item[]>;
  registerOnChange = (fn: any) => this.onChange = fn;
  registerOnTouched = (fn: any) => this.onTouched = fn;
  writeValue = (value) => this.value = value;
  asFormGroup = (abstractControl: AbstractControl) => abstractControl as FormGroup;
  searchOkpd2 = (query, items: Okpd2Item[]) => items;

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.formArray = this.fb.array((this.value || [null]).map(p => this.getFormPosition(p)));
    this.cd.detectChanges();
  }

  getFormPosition(position?: KimPriceOrderPosition): FormGroup {
    const form = this.fb.group({
      controlId: [null],
      okpd2: [null, Validators.required],
      maxPrice: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
      comment: [null]
    });
    form.patchValue(position || {});
    return form;
  }

  submit() {
    if (this.formArray.valid) {
      const value = this.value.map((item) => ({...item, ...this.formArray.value.find(({controlId}) => controlId === item.controlId)}));

      this.writeValue(value);

      if (this.onChange) {
        this.onChange(value);
      }

      this.cancel.emit();
    }
  }
}
