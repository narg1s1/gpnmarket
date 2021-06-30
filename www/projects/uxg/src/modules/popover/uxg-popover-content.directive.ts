import { ChangeDetectorRef, Directive, Input, OnDestroy, Renderer2, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { UxgPopoverContentDirection } from "./uxg-popover-direction-enum";
import { UxgPopoverComponent } from "./uxg-popover.component";
import { takeUntil } from "rxjs/operators";

@Directive({ selector: '[uxgPopoverContent]' })
export class UxgPopoverContentDirective implements OnDestroy {

  @Input() uxgPopoverContent: UxgPopoverContentDirection;
  destroy$ = new Subject();

  constructor(
    private host: UxgPopoverComponent,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {
      this.host.changeState$.pipe(takeUntil(this.destroy$)).subscribe(visible => {
        if (visible) {
          const view = this.viewContainer.createEmbeddedView(this.templateRef);
          this.renderer.addClass(view.rootNodes[0], `app-popover-content`);
          this.renderer.addClass(view.rootNodes[0], this.uxgPopoverContent || UxgPopoverContentDirection.bottomLeft);
        } else {
          this.viewContainer.clear();
        }
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
