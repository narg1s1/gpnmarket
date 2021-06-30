import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from "rxjs";
import { map, tap } from "rxjs/operators";

@Component({
  selector: 'uxg-pagination',
  templateUrl: './uxg-pagination.component.html',
  styleUrls: ['./uxg-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UxgPaginationComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() total;
  @Input() pageSize;
  @Input() pages$: Observable<number>;
  @Input() siblingLimit = 3;
  @Input() showSizeChanger = false;
  @Input() pageSizeOptions: any[] = [
    {value: 10, label: '10'},
    {value: 50, label: '50'},
    {value: 100, label: '100'},
  ];

  @Output() change = new EventEmitter<number>();
  @Output() onPageSizeChanged = new EventEmitter<{value: number, label: number}>();

  private DEFAULT_PAGE_SIZE = 10;
  readonly change$ = new ReplaySubject(1);
  data$: Observable<{ fullPages: number[], pages: number[], firstItem: number, lastItem: number }>;
  currentPageSize = this.DEFAULT_PAGE_SIZE;


  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges({ total, pageSize }: SimpleChanges) {
    if ((total || pageSize) && this.total && this.pageSize) {
      this.change$.next();
    }
  }

  ngOnInit() {
    this.currentPageSize = this.pageSize || this.DEFAULT_PAGE_SIZE;
    this.data$ = combineLatest([this.pages$.pipe(tap(c => this.change.emit(c || 1))), this.change$]).pipe(
      map(([current]) => {
        current = current || 1;
        const fullPages = (new Array(Math.ceil(this.total / this.pageSize))).fill(null).map((_, i) => i + 1);
        const leftSiblingLength = Math.min(current - 1, this.siblingLimit);
        const rightSiblingLength = Math.min(fullPages.length - current, this.siblingLimit);
        const firstItem = (current - 1) * this.pageSize + 1;
        const lastItem = Math.min((current - 1) * this.pageSize + this.pageSize, this.total);
        const pages = fullPages
            .filter(p => p >= current - leftSiblingLength + rightSiblingLength - this.siblingLimit)
            .filter(p => p <= current - leftSiblingLength + rightSiblingLength + this.siblingLimit);
        this.cdr.detectChanges();
        return { fullPages, pages, firstItem, lastItem };
      })
    );
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  pageSizeChanged($event) {
    this.onPageSizeChanged.emit($event);
    this.cdr.detectChanges();
  }
}
