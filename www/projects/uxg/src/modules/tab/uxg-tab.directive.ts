import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { UxgTabTitleComponent } from "./uxg-tab-title.component";
import { Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";

@Directive({
  selector: '[uxgTab]'
})
export class UxgTabDirective implements OnDestroy {

  readonly destroy$ = new Subject();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input()
  set uxgTab({toggle, active}: UxgTabTitleComponent) {
    toggle.pipe(startWith(active), takeUntil(this.destroy$)).subscribe((isVisible) => this.toggle(isVisible));
  }

  toggle(isVisible) {
    if (isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
