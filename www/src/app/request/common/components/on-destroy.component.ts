/**
 * Абстрактный класс для автоматической отписки внутри компонента
 * Как использовать:
 * export class SomeComponent extends OnDestroyDirective {
 *     stream$: Observable<any> = new Subject();
 *
 *     constructor(private someService: SomeService) {
 *         super();
 *         stream$.next(someData);
 *     }
 *
 *     this.someService.someStream().pipe(
 *         takeUntil(this.destroy$) поток будет выполняться до тех пор пока в this.destroy$ не возникнет событие
 *         ...список других операторов
 *     ).subscribe(...)
 *
 *     someMethod() {
 *         this.stream$.pipe(
 *             takeUntil(this.destroy$)
 *             ...список других операторов
 *         )
 *     }
 * }
 */

import {Subject} from 'rxjs';
import {Directive, OnDestroy} from '@angular/core';

@Directive()
export abstract class OnDestroyDirective implements OnDestroy {
    protected destroy$: Subject<void>;

    public constructor() {
        this.destroy$ = new Subject();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
