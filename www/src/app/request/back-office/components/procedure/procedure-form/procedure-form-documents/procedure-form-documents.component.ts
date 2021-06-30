import { AfterContentInit, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { RequestDocument } from "../../../../../common/models/request-document";

@Component({
  selector: 'app-request-procedure-form-documents',
  templateUrl: './procedure-form-documents.component.html',
  styleUrls: ['./procedure-form-documents.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProcedureFormDocumentsComponent),
    multi: true
  }]
})
export class ProcedureFormDocumentsComponent implements AfterContentInit, ControlValueAccessor {
  @Input() documents: RequestDocument[];
  @Output() addDocuments = new EventEmitter();
  public onTouched: (value) => void;
  public onChange: (value) => void;
  public form: FormGroup;
  public value: RequestDocument[];

  constructor(private fb: FormBuilder) {}

  get formDocuments() {
    return this.form.get("documents") as FormArray;
  }

  ngAfterContentInit() {
    this.form = this.fb.group({
      checked: false,
      documents: this.documents ? this.fb.array(this.documents.map(document => this.fb.group({
        checked: this.value && !!this.value.find(({id}) => document.id === id),
        document }))) : this.fb.array([])
    });

    this.form.valueChanges.subscribe(value => {
      const documents = this.formDocuments.value.filter(data => data.checked).map(({document}) => document);
      this.writeValue(documents);
      this.onChange(documents);
    });
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  writeValue(value): void { this.value = value; }
}
