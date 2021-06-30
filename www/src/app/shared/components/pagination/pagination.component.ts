import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from "rxjs";
import { map, tap } from "rxjs/operators";

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() total;
  @Input() pageSize;
  @Input() pages$: Observable<number>;
  @Input() siblingLimit = 3;
  @Output() change = new EventEmitter<number>();
  readonly change$ = new ReplaySubject(1);
  data$: Observable<{ fullPages: number[], pages: number[], firstItem: number, lastItem: number }>;

  ngOnChanges({ total, pageSize }: SimpleChanges) {
    if ((total || pageSize) && this.total && this.pageSize) {
      this.change$.next();
    }
  }

  ngOnInit() {
    this.data$ = combineLatest([this.pages$.pipe(tap(c => this.change.emit(c || 1))), this.change$]).pipe(
      map(([current]) => {
        current = current || 1;
        const fullPages = (new Array(Math.ceil(this.total / this.pageSize))).fill(null).map((v, i) => i + 1);
        const leftSiblingLength = Math.min(current - 1, this.siblingLimit);
        const rightSiblingLength = Math.min(fullPages.length - current, this.siblingLimit);
        const firstItem = (current - 1) * this.pageSize + 1;
        const lastItem = Math.min((current - 1) * this.pageSize + this.pageSize, this.total);
        const pages = fullPages
            .filter(p => p >= current - leftSiblingLength + rightSiblingLength - this.siblingLimit)
            .filter(p => p <= current - leftSiblingLength + rightSiblingLength + this.siblingLimit);

        return { fullPages, pages, firstItem, lastItem };
      })
    );
  }
}
