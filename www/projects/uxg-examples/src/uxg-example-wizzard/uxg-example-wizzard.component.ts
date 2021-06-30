import { Component, OnInit } from '@angular/core';
import { UxgWizzard, UxgWizzardBuilder } from "uxg";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: 'uxg-example-wizard',
  templateUrl: './uxg-example-wizzard.component.html',
})
export class UxgExampleWizzardComponent implements OnInit {
  form: FormGroup;
  wizzard: UxgWizzard;

  constructor(
    private fb: FormBuilder,
    private wb: UxgWizzardBuilder,
  ) {}

  ngOnInit() {
    this.wizzard = this.wb.create({
      step1: "Initial",
      step2: "General",
      step3: "Finnalize",
    });
  }
}
