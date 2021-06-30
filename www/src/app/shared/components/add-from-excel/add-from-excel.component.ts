import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { CustomValidators } from "../../forms/custom.validators";

@Component({
  selector: 'app-add-from-excel',
  templateUrl: './add-from-excel.component.html',
  styleUrls: ['./add-from-excel.component.css']
})
export class AddFromExcelComponent implements OnInit {

  @Input() templateUrl: string;
  @Input() isNew = false;
  @Input() buttonLabel = 'Добавить';
  @Input() isLoading: boolean;

  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<{ files: File[], requestName: string }>();
  @Output() publish = new EventEmitter<{ files: File[], requestName: string }>();

  form = this.fb.group({
    files: [[], [Validators.required, Validators.minLength(1)]]
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    if (this.isNew) {
      this.form.addControl("requestName", this.fb.control("", CustomValidators.requiredNotEmpty));
    }
  }

  get disabled() {
    return this.form.invalid || this.form.disabled || this.isLoading;
  }
}
