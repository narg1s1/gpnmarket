import { Directive, Host, Input, OnInit } from '@angular/core';
import { debounceTime, flatMap, tap } from "rxjs/operators";
import { Observable, pipe } from "rxjs";
import { NgControl } from "@angular/forms";
import { UxgDropdownInputComponent } from "uxg";
import { Okpd2Service } from "../services/okpd2.service";

@Directive({
  selector: '[appOkpdSuggestions]',
  exportAs: 'appOkpdSuggestions'
})
export class OkpdSuggestionsDirective implements OnInit {
  @Input() minLength = 1;
  suggestions$: Observable<any>;

  constructor(
    private ngControl: NgControl,
    private okpd2Service: Okpd2Service,
    @Host() private dropdownInputComponent: UxgDropdownInputComponent
  ) {}

  ngOnInit() {
    this.suggestions$ = this.ngControl.valueChanges.pipe(
      tap(value => {
        if (value?.length < this.minLength) {
          this.dropdownInputComponent.toggle(false);
        }
      }),
      pipe(
        debounceTime(150),
        flatMap(value => this.okpd2Service.getOkpd2List(value)),
      ),
      tap(() => this.dropdownInputComponent.toggle(true))
    );
  }
}
