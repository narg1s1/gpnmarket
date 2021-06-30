import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: 'uxg-filter',
  templateUrl: './uxg-filter.component.html'
})
export class UxgFilterComponent implements OnInit, OnDestroy {
  @HostBinding('class.app-aside-modal') class = true;
  @HostBinding('class.app-col-aside') colAside = true;
  @HostBinding('class.app-row') row = true;
  @HostBinding('class.app-flex-column') flexColumn = true;
  @Input() @HostBinding('class.detachable') detachable = true;
  @Input() @HostBinding('class.initially-hidden') initiallyHidden = false;
  @HostBinding('class.open') isOpen: boolean;
  @Input() count: number;
  @Input() formGroup: FormGroup;
  @Input() liveFilter = true;
  @Input() debounceTime = 300;
  @Input() skipKeys: string[] = []; // Не учавствующие в подсчетах фильтры (например, табы)
  @Output() filter = new EventEmitter();
  @Output() reset = new EventEmitter();
  readonly destroy$ = new Subject();

  get activeFilters() {
    return Object.entries(this.formGroup.value).filter(
      ([k, v]) => !this.skipKeys.includes(k) && v instanceof Array && v.length > 0 || !(v instanceof Array) && v
    );
  }

  ngOnInit() {
    if (this.liveFilter) {
      this.formGroup.valueChanges.pipe(
        debounceTime(this.debounceTime),
        takeUntil(this.destroy$)
      ).subscribe(value => this.filter.emit(value));
    }
  }

  public open() {
    this.renderer.addClass(this.document.body, "aside-modal-open");
    this.isOpen = true;
  }

  public close() {
    this.renderer.removeClass(this.document.body, "aside-modal-open");
    this.isOpen = false;
  }

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
