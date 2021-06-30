import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { KimPriceOrderPosition } from "../../../../common/models/kim-price-order-position";
import { Uuid } from "../../../../../cart/models/uuid";
import { Guid } from "guid-typescript";
import { shareReplay } from "rxjs/operators";
import { Okei } from "../../../../../shared/models/okei";
import { OkeiService } from "../../../../../shared/services/okei.service";

@Component({
  selector: 'app-kim-price-order-form-positions',
  templateUrl: './form-positions.component.html',
  styleUrls: ['./form-positions.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PriceOrderFormPositionsComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderFormPositionsComponent implements ControlValueAccessor, AfterViewInit {
  @Output() cancel = new EventEmitter();
  formArray: FormArray;
  value?: (KimPriceOrderPosition & {controlId: Uuid})[];
  onTouched: (value) => void;
  onChange: (value) => void;
  readonly okeiList$ = this.okeiService.getOkeiList().pipe(shareReplay(1));

  registerOnChange = (fn: any) => this.onChange = fn;
  registerOnTouched = (fn: any) => this.onTouched = fn;
  writeValue = (value) => this.value = value;
  asFormGroup = (abstractControl: AbstractControl) => abstractControl as FormGroup;
  getOkeiSymbol = ({symbol}: Okei) => symbol && symbol.toLowerCase();

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, public okeiService: OkeiService) {}

  ngAfterViewInit() {
    this.formArray = this.fb.array((this.value || [null]).map(p => this.fetchFormPosition(p)), Validators.required);
    this.cd.detectChanges();
  }

  fetchFormPosition(position?: KimPriceOrderPosition): FormGroup {
    const form = this.fb.group({
      controlId: Guid.create().toString(),
      name: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.0001), Validators.pattern(/^\d+$/)]],
      okei: [null, Validators.required],
    });
    form.patchValue(position || {});
    return form;
  }

  submit() {
    if (this.formArray.valid) {
      const value: (KimPriceOrderPosition & {controlId: Uuid})[] = this.formArray.value.reduce((positions, position) => {
        const i = (this.value || []).findIndex(({controlId}) => position.controlId === controlId);
        positions.push({ ...(this.value || [])[i], ...position });
        return positions;
      }, []);

      this.writeValue(value);

      if (this.onChange) {
        this.onChange(value);
      }

      this.cancel.emit();
    }
  }
}
