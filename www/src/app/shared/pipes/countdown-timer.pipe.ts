import { ChangeDetectorRef, Injector, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { interval } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AsyncPipe } from "@angular/common";
import * as moment from "moment";

/**
 * Пайп для асинхронного счетчика оставшегося времени
 *
 * Входное значение - дата от которой происходит отчет.
 * Параметр - количество секунд, которое нужно отсчитать от входной даты.
 *
 * @example "2000-01-01T00:00" | countdownTimer: 60
 */
@Pipe({
  name: 'countdownTimer', pure: false
})
export class CountdownTimerPipe implements PipeTransform, OnDestroy {
  protected asyncPipe: AsyncPipe;
  protected timer$;

  protected defaultDurations = 10 * 60;

  constructor(private injector: Injector) {
    this.asyncPipe = new AsyncPipe(injector.get(ChangeDetectorRef));
  }

  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }

  transform(value: any, durationSeconds?: number): any {
    durationSeconds = durationSeconds || this.defaultDurations;

    const timer = this.timer$ || (this.timer$ = interval(1000).pipe(
      startWith(0),
      map(() => {
        const durationReview = durationSeconds - moment().diff(moment(value), 'seconds');

        return moment.utc(durationReview * 1000).format('mm:ss');
      })
    ));

    return this.asyncPipe.transform(timer);
  }
}
