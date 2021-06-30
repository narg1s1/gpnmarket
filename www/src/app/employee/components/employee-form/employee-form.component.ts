import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { EmployeeInfoBrief } from "../../models/employee-info";
import { TextMaskConfig } from "angular2-text-mask/src/angular2TextMask";

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  @Input() employee: EmployeeInfoBrief;
  @Input() employeeActiveTabType = 'BACKOFFICE_BUYER';
  @Input() roleSelectorDisabled = true;
  @Output() cancel = new EventEmitter();
  @Output() addEmployee = new EventEmitter<EmployeeInfoBrief>();
  @Output() editEmployee = new EventEmitter<EmployeeInfoBrief>();

  form: FormGroup;

  readonly phoneMask: TextMaskConfig = {
    mask: value => ['+', '7', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
    guide: false,
    keepCharPositions: false,
    showMask: true
  };

  get isEditing(): boolean {
    return !!this.employee;
  }

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      id: [this.defaultEmployeeValue('id', null)],
      username: [this.defaultEmployeeValue('username', null), [Validators.required, CustomValidators.email]],
      phone: [this.defaultEmployeeValue('phone', null), [Validators.required, CustomValidators.phone]],
      firstName: [this.defaultEmployeeValue('firstName', null), [Validators.required, CustomValidators.cyrillicName]],
      lastName: [this.defaultEmployeeValue('lastName', null), [Validators.required, CustomValidators.cyrillicName]],
      middleName: [this.defaultEmployeeValue('middleName', null)],
      position: [this.defaultEmployeeValue('position', null), [Validators.required, CustomValidators.cyrillic]],
      role: [this.employeeActiveTabType, [Validators.required]],
    });
    if (this.isEditing) {
      this.form.get('username').disable();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.form.reset();
  }

  onAddEmployee() {
    if (this.form.valid) {
      const value = this.form.value;
      if (this.form.pristine) {
        this.cancel.emit();
      } else {
        this.isEditing ? this.editEmployee.emit(value) : this.addEmployee.emit(value);
        this.form.reset();
      }
    }
  }

  defaultEmployeeValue = (field: keyof EmployeeInfoBrief, defaultValue: any = "") => this.employee && this.employee[field] || defaultValue;
}
