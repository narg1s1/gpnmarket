import { Directive, ElementRef, Inject, InjectionToken, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from "@angular/common";
import { Subject } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { Instance } from "flatpickr/dist/types/instance";
import { Options } from "flatpickr/dist/types/options";
import { Russian } from "flatpickr/dist/l10n/ru";
import flatpickr from "flatpickr";

@Directive({
  selector: '[uxgDatepicker]',
  exportAs: 'uxgDatepicker',
})
export class UxgDatepickerDirective implements OnInit, OnDestroy, Options {
  @Input() altFormat: Options["altFormat"];
  @Input() altInput: Options["altInput"];
  @Input() appendTo: Options["appendTo"];
  @Input() dateFormat: Options["dateFormat"] = "d.m.Y";
  @Input() defaultDate: Options["defaultDate"];
  @Input() disable: Options["disable"];
  @Input() enable: Options["enable"];
  @Input() enableSeconds: Options["enableSeconds"];
  @Input() enableTime: Options["enableTime"];
  @Input() inline: Options["inline"];
  @Input() locale: Options["locale"] = Russian;
  @Input() maxDate: Options["maxDate"];
  @Input() maxTime: Options["maxTime"];
  @Input() minDate: Options["minDate"];
  @Input() minTime: Options["minTime"];
  @Input() mode: Options["mode"];
  @Input() monthSelectorType: Options["monthSelectorType"];
  @Input() position: Options["position"];
  @Input() showMonths: Options["showMonths"];
  @Input() time_24hr: Options["time_24hr"] = true;
  @Input() wrap: Options["wrap"];

  flatpickr: Instance;
  open: Instance["open"];
  close: Instance["close"];
  readonly onScroll$ = new Subject();
  readonly onScrollFn = () => this.onScroll$.next();

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.flatpickr = flatpickr(this.el.nativeElement, {
      ...this,
      onOpen: () => isPlatformBrowser(this.platformId) ? window.addEventListener('scroll', this.onScrollFn, true) : null,
      onClose: () => isPlatformBrowser(this.platformId) ? window.removeEventListener('scroll', this.onScrollFn, true) : null
    });
    this.open = this.flatpickr.open;
    this.close = this.flatpickr.close;

    this.onScroll$.pipe(throttleTime(50)).subscribe(() => this.flatpickr._positionCalendar());
  }

  ngOnDestroy() {
    this.flatpickr.destroy();
    this.onScroll$.complete();
  }
}
