import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from "@angular/forms";
import { Subscription } from "rxjs";

@Directive({selector: '[appFormControlInvalidClass]'})
export class ControlInvalidClassDirective implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private el: ElementRef, private ngControl: NgControl) {
  }

  ngOnInit() {
    const invalidClass = this.el.nativeElement.getAttribute('appFormControlInvalidClass');
    const control = this.ngControl.control;

    this.subscription = this.ngControl.valueChanges.subscribe(() => {
      if (invalidClass && control.errors && (control.touched || control.dirty)) {
        this.el.nativeElement.classList.add(invalidClass);
      } else {
        this.el.nativeElement.classList.remove(invalidClass);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
