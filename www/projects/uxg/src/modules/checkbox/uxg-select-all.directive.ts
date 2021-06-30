import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormGroup, NgControl } from "@angular/forms";
import { UxgCheckboxComponent } from "./uxg-checkbox.component";
import { Subject } from "rxjs";
import { filter, map, mapTo, takeUntil, tap } from "rxjs/operators";
import { pipeFromArray } from "rxjs/internal/util/pipe";

@Directive({
  selector: '[uxgSelectAllFor]'
})
export class UxgSelectAllDirective implements OnInit, OnDestroy {
  @Input() uxgSelectAllFor: string;
  @Input() slave: boolean;
  @Input() mixedWithDisabled = false;
  destroy$ = new Subject();

  constructor(@Optional() private component: UxgCheckboxComponent, private ngControl: NgControl) {}

  ngOnInit() {
    const control: AbstractControl = this.ngControl.control;
    const controlName = Object.keys(control.parent.controls).find(key => control.parent.get(key) === control);
    let listen = true;

    const pipes = (action: (children: AbstractControl[]) => void) => pipeFromArray([
      mapTo(control.parent.get(this.uxgSelectAllFor)),
      filter(Boolean),
      filter(() => listen),
      filter(() => control.enabled),
      tap(() => listen = false),
      map(({ controls }) => controls.map(({ controls: c }: FormGroup) => c[controlName])),
      tap((children: AbstractControl[]) => !this.slave && action(children)),
      tap((children: AbstractControl[]) => this.component && (this.component.isMixed = children.filter(c => c.enabled || this.mixedWithDisabled).length > children.filter(c => c.value).length)),
      tap(() => listen = true),
      takeUntil(this.destroy$)
    ]);

    control.valueChanges.pipe(
      tap(() => control.setValue(control.value, { emitEvent: false })),
      pipes(children => children.filter(c => !c.disabled).forEach(c => c.setValue(control.value)))
    ).subscribe();

    control.parent.get(this.uxgSelectAllFor).valueChanges.pipe(pipes(
      children => control.setValue(children.filter(c => c.value && c.enabled).length > 0)
    )).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
