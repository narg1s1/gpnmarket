import { UxgFilterCheckboxItem } from './../uxg-filter-checkbox-item';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { UxgFilterCheckboxList } from './../uxg-filter-checkbox-item';

@Component({
  selector: 'uxg-filter-multi-select-list',
  templateUrl: './uxg-filter-multi-select-list.component.html',
  styleUrls: ['./uxg-filter-multi-select-list.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UxgFilterMultiSelectListComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UxgFilterMultiSelectListComponent implements ControlValueAccessor, OnDestroy {
  @Input() items$: Observable<UxgFilterCheckboxList>;
  @Input() minLength = 0;
  @Input() searchPlaceholder = "";

  public checkedItemsList: UxgFilterCheckboxList = [];

  readonly searchControl = this.fb.control("");
  readonly destroy$ = new Subject();

  public value;
  public onTouched: (value) => void;
  public onChange: (value) => void;
  registerOnChange = (fn) => this.onChange = fn;
  registerOnTouched = (fn) => this.onTouched = fn;
  setDisabledState = (disabled: boolean) => {
    if (disabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  writeValue = (value) => {
    this.value = value;
    if (value === null) {
      this.checkedItemsList = [];
      this.cd.detectChanges();
    }
  }

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number) {
    return index;
  }

  getItemLabel = (item) => item.label || item.name;

  addCheckedItem(item) {
    if (!this.checkedItemsList.find(checkedItem => checkedItem.value === item.value)) {
      this.checkedItemsList.push(item);
    }
    this.searchControl.reset();
    this.onChange(this.checkedItemsList.map((checkedItem: UxgFilterCheckboxItem<{value: any; label: any}>) => checkedItem.value.value));
  }

  removeItem(item) {
    this.checkedItemsList = this.checkedItemsList.filter(checkedItem => checkedItem.value !== item.value);
    this.onChange(this.checkedItemsList.map((checkedItem: UxgFilterCheckboxItem<{value: any; label: any}>) => checkedItem.value.value));
  }

  searchItems = (q: string, checkboxes: any[]): string[] => {
    return checkboxes.filter(checkbox => checkbox?.label?.toString().toLowerCase().includes(q?.toLowerCase()));
  }
}
