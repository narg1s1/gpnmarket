import { UxgDropdownInputComponent } from './uxg-dropdown-input.component';
import { Directive, Host, Input, OnInit } from '@angular/core';
import { debounceTime, filter, flatMap, map, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[uxgSuggestions]',
  exportAs: 'uxgSuggestions'
})
export class UxgSuggestionsDirective implements OnInit {
  suggestions$: Observable<any>;
  @Input() minLength = 1;
  @Input() $: Observable<any>;
  @Input() searchFn: (query, data) => any = () => true;

  constructor(private ngControl: NgControl, @Host() private dropdownInputComponent: UxgDropdownInputComponent) {}

  ngOnInit() {
    this.suggestions$ = this.ngControl.valueChanges.pipe(
      debounceTime(100),
      tap(value => {
        if (value?.length ?? 0 < this.minLength) {
          this.dropdownInputComponent.toggle(false);
        }
      }),
      filter(value => (value?.length ?? 0) >= this.minLength && this.dropdownInputComponent.isNotFromList),
      flatMap(value => this.$.pipe(map(data => this.searchFn && this.searchFn(value, data)))),
      tap(() => this.dropdownInputComponent.toggle(true))
    );

    this.dropdownInputComponent.focus.pipe(
      filter(() => this.minLength === 0 && this.ngControl.pristine && !this.ngControl.value),
      tap(() => this.dropdownInputComponent.isNotFromList = true),
      tap(() => this.ngControl.control.updateValueAndValidity())
    ).subscribe();
  }
}
