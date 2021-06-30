import { AfterContentInit, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { startWith } from "rxjs/operators";
import { ProcedureAction } from "../../../../models/procedure-action";

@Component({
  selector: 'app-request-procedure-form-properties',
  templateUrl: './procedure-form-properties.component.html',
  styleUrls: ['./procedure-form-properties.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProcedureFormPropertiesComponent),
    multi: true
  }]
})
export class ProcedureFormPropertiesComponent implements AfterContentInit, ControlValueAccessor {
  @Input() action: ProcedureAction["action"] = "create";
  @Input() procedureForm: FormGroup;
  @Output() publicAccessChange = new EventEmitter();
  public onTouched: (value) => void;
  public onChange: (value) => void;
  public form: FormGroup;
  public value;

  constructor(private fb: FormBuilder) {}

  ngAfterContentInit() {
    this.form = this.fb.group({
      manualEndRegistration: this.default("manualEndRegistration", false),
      positionsRequiredAll: this.default("positionsRequiredAll", false),
      positionsAnalogs: this.default("positionsAnalogs", false),
      positionsAllowAnalogsOnly: this.default("positionsAllowAnalogsOnly", false),
      positionsEntireVolume: this.default("positionsEntireVolume", false),
      positionsSuppliersVisibility: this.default("positionsSuppliersVisibility", 'NameHidden'),
      positionsBestPriceType: this.default("positionsBestPriceType", 'LowerStartPrice'),
      positionsApplicsVisibility: this.default("positionsApplicsVisibility", 'PriceAndRating'),

      contractSubject: this.default("contractSubject", null),
      startPrice: this.default("startPrice", null),
      contractConditions: this.fb.group({
        quantity: this.default("quantity", null),
        isAlternateQuantity: this.default("isAlternateQuantity", false),
        term: this.default("term", null),
        isAlternateTerm: this.default("isAlternateTerm", false),
        address: this.default("address", null),
        isAlternateAddress: this.default("isAlternateAddress", false),
      })
    });

    if (this.action === 'bargain') {
      [
        'positionsRequiredAll',
        'positionsAnalogs',
        'positionsAllowAnalogsOnly',
        'positionsEntireVolume',
        'contractSubject',
        'startPrice',
        'contractConditions.quantity',
        'contractConditions.isAlternateQuantity',
        'contractConditions.term',
        'contractConditions.isAlternateTerm',
        'contractConditions.address',
        'contractConditions.isAlternateAddress',
      ].forEach(k => this.form.get(k).disable());

      this.form.addControl('bestPriceRequirements', this.fb.control(this.default("bestPriceRequirements", false)));
    }

    // Отслеживаем Обязательная подача предложений на все позиции
    let positionsRequiredAll$ = this.form.get('positionsRequiredAll').valueChanges;

    if (this.action !== 'bargain') {
      positionsRequiredAll$ = positionsRequiredAll$.pipe(startWith(<{}>this.form.get('positionsRequiredAll').value));
    }
    positionsRequiredAll$.subscribe(value => {
      const positionsAnalogs = this.form.get('positionsAnalogs');
      const analogsOnly = this.form.get('positionsAllowAnalogsOnly');

      if (!value && positionsAnalogs) {
        analogsOnly.enable();
      } else {
        analogsOnly.disable();
        analogsOnly.setValue(false);
      }
    });

    // Отслеживаем Разрешается прием аналогов
    let analogsValueChanges$ = this.form.get('positionsAnalogs').valueChanges;

    if (this.action !== 'bargain') {
      analogsValueChanges$ = analogsValueChanges$.pipe(startWith(<{}>this.form.get('positionsAnalogs').value));
    }
    analogsValueChanges$.subscribe(value => {
      const analogsOnly = this.form.get('positionsAllowAnalogsOnly');
      const positionsRequiredAll = this.form.get('positionsRequiredAll');

      if (value && !positionsRequiredAll.value) {
        analogsOnly.enable();
      } else {
        analogsOnly.disable();
        analogsOnly.setValue(false);
      }
    });

    this.form.valueChanges.pipe(startWith({})).subscribe(() => {
      this.writeValue(this.form.getRawValue());
      this.onChange(this.form.getRawValue());
    });

    if (this.procedureForm.get('general.withoutTotalPrice')?.value) {
      this.form.get('startPrice').setValue(null);
      this.form.get('startPrice').disable();
    }
  }

  default = (k, v) => this.value?.[k] ?? v;
  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  writeValue = value => this.value = value;
}
