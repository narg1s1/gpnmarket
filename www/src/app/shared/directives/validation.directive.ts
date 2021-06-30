import { Directive, ElementRef, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormGroup, FormGroupDirective, NgForm, NgModelGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[appFormValidation]',
})
export class ValidationDirective implements OnInit, OnDestroy {

  readonly destroy$ = new Subject();

  constructor(private el: ElementRef, @Optional() private ngForm: FormGroupDirective) {
  }

  ngOnInit() {
    this.ngForm.ngSubmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.ngForm.control.markAllAsTouched();

      (function markAsDirty(controls: { [key: string]: AbstractControl }) {
        Object.values(controls).forEach(c => {
          if (c instanceof FormGroup) {
            markAsDirty(c.controls);
          } else {
            c.markAsDirty();
            c.updateValueAndValidity({ onlySelf: true });
          }
        });
      })(this.ngForm.control.controls);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
