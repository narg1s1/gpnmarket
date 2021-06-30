import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { RequestPosition } from "../../../models/request-position";
import { Request } from "../../../models/request";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-request-create-template',
  templateUrl: './request-create-template.component.html',
  styleUrls: ["./request-create-template.component.scss"],
})
export class RequestCreateTemplateComponent implements OnInit {
  @Input() positions: RequestPosition[] = [];
  @Input() request: Request;
  @Output() createTemplate = new EventEmitter<{ positions: RequestPosition[], title: string, tag: string }>();
  @Output() close = new EventEmitter();

  form: FormGroup;

  constructor(public fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      tag: ''
    });
  }

  submit() {
    const {title, tag} = this.form.value;
    this.createTemplate.emit({positions: this.positions, title, tag});
    this.close.emit();
  }
}
