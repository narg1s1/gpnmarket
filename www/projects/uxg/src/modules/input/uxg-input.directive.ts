import { Directive, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractControl, NgControl } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[uxgInput], [uxgInput][lg]',
  exportAs: 'uxgInput',
})
export class UxgInputDirective implements OnInit, OnDestroy {
  @Input() lg: boolean | string;
  @Input() warning: boolean | string;
  @HostBinding('class.app-control') classInput = true;
  @HostBinding('class.app-control-large') get isLarge() { return this.is(this.lg); }
  @HostBinding('class.warning') get isWarning() { return this.is(this.warning); }
  @HostBinding('class.app-control-label-shown') get labelShown() {
    return this.ngControl?.control?.value?.toString().length;
  }

  readonly destroy$ = new Subject();

  constructor(private el: ElementRef, @Optional() public ngControl: NgControl) {}

  ngOnInit() {
    this.ngControl?.statusChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validate(this.ngControl.control));
  }

  @HostListener("blur")
  onBlur() {
    if (!this.ngControl?.control.pristine) {
      this.ngControl?.control.markAsTouched();
      this.validate(this.ngControl?.control);
    }
  }

  private validate(control: AbstractControl) {
    if (control?.touched && control?.dirty && control?.invalid) {
      this.el.nativeElement.classList.add('invalid');
    } else {
      this.el.nativeElement.classList.remove('invalid');
    }
  }

  private is = (prop?: boolean | string) => prop !== undefined && prop !== false;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
