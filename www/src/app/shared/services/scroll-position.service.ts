import { Injectable } from '@angular/core';
import { fromEvent } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class ScrollPositionService {
  public readonly scroll$ = fromEvent(window, 'scroll').pipe(startWith(0), debounceTime(100), map(() => window.scrollY));
}
