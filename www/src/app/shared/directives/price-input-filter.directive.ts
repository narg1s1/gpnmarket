import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from "rxjs";

@Directive({
  selector: '[appPriceInputFilter]',
})
export class PriceInputFilterDirective implements OnInit, OnDestroy {

  readonly destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {
  }

  ngOnInit() {
    this.renderer.listen(this.el.nativeElement, "keypress", this.filterEnteredText);
  }

  private filterEnteredText = (e: KeyboardEvent): boolean => {
    const key = Number(e.key);
    return (key >= 0 && key <= 9 || ['.', ','].indexOf(e.key) !== -1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
