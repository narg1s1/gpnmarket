import { AfterContentInit, Component, ContentChild, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, Output, TemplateRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CustomValidators } from "../../forms/custom.validators";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'select-items-with-search',
  templateUrl: './select-items-with-search.component.html',
  styleUrls: ['./select-items-with-search.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectItemsWithSearchComponent),
    multi: true
  }]
})
export class SelectItemsWithSearchComponent implements ControlValueAccessor, OnChanges, AfterContentInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() placeholder = "";
  @Input() trackBy: (item) => any;
  @Input() filterFn: (q, item) => boolean;
  @Input() disabledFn: (item) => boolean;
  @Input() liveUpdate = true;
  @Input() customFilterForm: FormGroup;
  @Input() isDisableFilter: boolean;

  @Output() filter = new EventEmitter();
  @ContentChild(TemplateRef) rowTplRef: TemplateRef<any>;
  @ContentChild('footerContentTpl') footerTplRef: TemplateRef<any>;
  @ContentChild('customFilterFields') customFilterFieldsRef: TemplateRef<any>;

  public onTouched: (value) => void;
  public onChange: (value) => void;
  public form: FormGroup;
  public value;
  public disabled: boolean;
  private subscription = new Subscription();

  get formItems() {
    return this.form?.get('items') as FormArray;
  }

  get checkedFormItems() {
    return this.formItems?.controls.filter(control => control.get("checked").value) || [];
  }

  constructor(private fb: FormBuilder) {}

  ngAfterContentInit() {
    this.trackBy = this.trackBy || (item => JSON.stringify(item));
    this.form = this.fb.group({
      search: "",
      checked: false,
      items: this.fb.array([], CustomValidators.oneOrMoreSelected)
    });

    this.setFormItems();

    if (this.liveUpdate) {
      this.subscription.add(
        this.formItems.valueChanges.subscribe(() => this.submit())
      );
    }

    if (this.filterFn) {
      this.form.get('search').valueChanges.subscribe((value) => this.formItems?.controls
        .filter(c => !this.disabledFn || !this.disabledFn(c.get('item').value)) // не учитываем позиции, задизейбленые функцией
        .forEach(c => !this.filterFn(value, c.get('item').value) ? c.disable() : c.enable()));

      // Обработка при изменениях кастомной формы, при её наличии
      this.customFilterForm?.valueChanges.subscribe(() => this.formItems?.controls
        .filter(c => !this.disabledFn || !this.disabledFn(c.get('item').value)) // не учитываем позиции, задизейбленые функцией
        .forEach(c => !this.filterFn(this.form.get('search').value, c.get('item').value) ? c.disable() : c.enable()));
    } else {
      this.form.get('search').valueChanges.pipe(debounceTime(300)).subscribe((value) => this.filter.emit(value));
    }
  }

  ngOnChanges() {
    this.setFormItems();
  }

  setFormItems() {
    if (this.filter.observers.length) {
      this.formItems?.controls.forEach(c => {
        c.disable();
        c.get('hidden').setValue(true);
      });
    } else {
      this.formItems?.clear();
    }

    this.items
      ?.filter(() => this.form)
      .forEach(item => {
        let formItem: AbstractControl;
        formItem = this.formItems.controls
          .find(formGroup => this.trackBy(formGroup.get('item').value) === this.trackBy(item));

        if (formItem) {
          formItem.get('item').setValue(item);
          formItem.get('hidden').setValue(false);
        } else {
          formItem = this.fb.group({
            checked: !!this.value?.find(_item => this.trackBy(_item) === this.trackBy(item)),
            hidden: false,
            item: item
          });

          this.formItems.controls.push(formItem);
          this.formItems['_registerControl'](formItem);
        }
        if (this.disabledFn && this.disabledFn(item)) {
          formItem.disable();
        } else if (formItem.disabled) {
          formItem.enable();
        }
      });
  }

  submit() {
    const value = this.formItems.controls
      .filter(group => group.get("checked").value)
      .map(control => control.get('item').value)
      .map(item => ({
        ...item,
        ...this.value?.find(_item => this.trackBy(_item) === this.trackBy(item))
      }));

    this.writeValue(value);
    this.onChange(value);
  }

  registerOnChange = (fn: any): void => this.onChange = fn;
  registerOnTouched = (fn: any): void => this.onTouched = fn;
  writeValue = (value): void => this.value = value;
  ngOnDestroy = () => this.subscription.unsubscribe();
  setDisabledState = (disabled: boolean) => this.disabled = disabled;
}
