import { tap } from 'rxjs/operators';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IUxgDataTableColumnHeader, IUxgDataTableTemplate } from './uxg-data-table.model';
import { ChangeDetectionStrategy, Component, ContentChildren, Input, OnInit, Output, TemplateRef, EventEmitter, ElementRef, ChangeDetectorRef, AfterViewInit, ViewChild, OnChanges, SimpleChanges, AfterContentInit } from '@angular/core';
import { Debounce } from './debounce.decorator';

@Component({
  selector: 'uxg-data-table',
  templateUrl: './uxg-data-table.component.html',
  styleUrls: ['./uxg-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UxgDataTableComponent implements OnInit, AfterViewInit, OnChanges, AfterContentInit {

  // Заголовки
  @Input() columnHeaders: IUxgDataTableColumnHeader[];

  // Данные
  @Input() itemsData: any[];

  @Input() allowSelect: boolean;
  @Input() allowCustomizeColumns: boolean;
  @Input() saveSelectedInLocalStorage: boolean;
  @Input() isLoading = false;
  @Input() scrollDistance = 500;
  @Input() offsetTopForStickyHeader: number;

  // Настройки пагинации
  @Input() isPaginationEnabled: boolean;
  @Input() totalItemsCount = 0;
  @Input() pageSize = 10;
  @Input() pages$ = of(1);
  @Input() siblingPagesLimit = 2;
  @Input() showSizeChanger: boolean;
  @Input() pageSizeOptions: any[] = [
    {value: 5, label: '5'},
    {value: 10, label: '10'},
    {value: 20, label: '20'}
  ];

  // Тексты в модалке
  @Input() modalTitle = 'Настройки отображения таблицы';
  @Input() modalDescription = 'Выберите все параметры, которые хотите отображать в таблице позиций. Вы можете выбрать любое количество параметров';

  // Коллбек сортировки
  @Output() onSort = new EventEmitter<{orderBy: string, sortDirection: 'ASC' | 'DESC'}>();

  // Коллбек скролла таблицы
  @Output() onTableScroll = new EventEmitter<Event>();

  // Коллбек выбора страницы
  @Output() onPageIndexChanged = new EventEmitter<number>();

  // Коллбек выбора кол-ва элементов на странице
  @Output() onPageSizeChanged = new EventEmitter<{value: number, label: string | number}>();

  // Коллбек выбора позиции
  @Output() onPositionSelected = new EventEmitter<any>();

  // Коллбек выбора группы позиции
  @Output() onGroupPositionSelected = new EventEmitter<any>();

  // Корневой элемент таблицы
  @ViewChild('uxgDatatable') uxgDatatable: ElementRef;
  @ViewChild('uxgDatatableHeader') uxgDatatableHeader: ElementRef;

  // Шаблоны столбцов
  @ContentChildren(TemplateRef) templates: TemplateRef<IUxgDataTableTemplate<any>>[] = [];

  public isPopupVisible = false;
  public clonedColumnHeaders = [];

  private CHECKBOX_COLUMN_WIDTH = 40;
  private PINNED_COLUMN_WIDTH = 250;
  private STORAGE_KEY = null;

  get isScrollLeftDisabled(): boolean {
    return this.uxgDatatable?.nativeElement?.scrollLeft === 0;
  }

  get isScrollRightDisabled(): boolean {
    const el = this.uxgDatatable?.nativeElement;
    return el && (el.scrollWidth - el.scrollLeft) <= el.offsetWidth;
  }

  get leftArrowOffset(): number {
    const isSomeColumnPinnable = this.columnHeaders.some(col => col.pinnable && col.isVisible);
    return (this.allowSelect || this.allowCustomizeColumns)
      ? this.CHECKBOX_COLUMN_WIDTH + (isSomeColumnPinnable ? this.PINNED_COLUMN_WIDTH : 0)
      : 0;
  }

  get visibleColumns(): IUxgDataTableColumnHeader[] {
    return this.clonedColumnHeaders.filter(col => col.isVisible);
  }

  constructor(private cdr: ChangeDetectorRef, private storage: StorageMap, private router: Router) {}

  ngOnInit() {
    const currentPath = this.router.url.split('?')[0].split('/').pop();
    this.STORAGE_KEY = `uxgVisibleColumns(${currentPath})`;

    if (this.saveSelectedInLocalStorage) {
      this.storage.get(this.STORAGE_KEY)
        .pipe(
          first(),
          switchMap((storageColumns: IUxgDataTableColumnHeader[]) => {
            if (storageColumns?.length) {
              this.columnHeaders.forEach((columnHeader: IUxgDataTableColumnHeader) => {
                columnHeader.isVisible = !!storageColumns.find(col => col.alias === columnHeader.alias);
              });
              return of(storageColumns);
            } else {
              return this.storage.set(this.STORAGE_KEY, this.visibleColumns);
            }
          }),
          tap(() => {
            this.clonedColumnHeaders = JSON.parse(JSON.stringify(this.columnHeaders));
          })
        ).subscribe(() => {
          this.cdr.detectChanges();
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.columnHeaders?.firstChange) {
      this.clonedColumnHeaders = JSON.parse(JSON.stringify(this.columnHeaders));
    }
    // Скроллим uxgDatatable после сортировки, если заголовок был проскроллен
    if (changes.itemsData?.currentValue && this.itemsData && this.uxgDatatableHeader?.nativeElement.scrollLeft > 0) {
      setTimeout(_ => {
        this.uxgDatatable.nativeElement.scrollTo(this.uxgDatatableHeader.nativeElement.scrollLeft, 0);
      });
    }
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  ngAfterContentInit() {
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  public sortBy(header: IUxgDataTableColumnHeader) {
    this.columnHeaders.forEach(col => {
      col.sorted = false;
    });
    header.sortDirection = header.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    header.sorted = true;
    this.onSort.emit({
      orderBy: header.alias,
      sortDirection: header.sortDirection
    });
  }

  public toggleCustomizeColumnsPopup(event: boolean) {
    this.isPopupVisible = event;
  }

  public isColumnVisible(index: number): boolean {
    return this.columnHeaders[index]?.isVisible;
  }

  public isColumnPinnable(index: number): boolean {
    return !!this.columnHeaders[index]?.pinnable;
  }

  public scrollDatatable(direction: 'left' | 'right') {
    this.cdr.detach();
    const currentScrollDistance = this.uxgDatatable.nativeElement.scrollLeft;
    const currentScrollHeaderDistance = this.uxgDatatable.nativeElement.scrollLeft;

    if (direction === 'left') {
      this.uxgDatatable.nativeElement.scrollTo(currentScrollDistance - this.scrollDistance, 0);
      this.uxgDatatableHeader.nativeElement.scrollTo(currentScrollHeaderDistance - this.scrollDistance, 0);
    }
    if (direction === 'right') {
      this.uxgDatatable.nativeElement.scrollTo(currentScrollDistance + this.scrollDistance, 0);
      this.uxgDatatableHeader.nativeElement.scrollTo(currentScrollHeaderDistance + this.scrollDistance, 0);
    }
    this.cdr.reattach();
  }

  @Debounce()
  public onTableScrolled(event) {
    this.onTableScroll?.emit(event);
    this.cdr.detectChanges();
  }

  public pageIndexChanged(page: number) {
    this.onPageIndexChanged?.emit(page);
    this.cdr.detectChanges();
  }

  public pageSizeChanged(payload: {value: number, label: string | number}) {
    this.onPageSizeChanged?.emit(payload);
    this.cdr.detectChanges();
  }

  public onToggleColumnVisibility(event) {
    if (!this.saveSelectedInLocalStorage) {return; }
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  public togglePositions(_selected: boolean, item: any) {
    item.positions = item.positions.map(pos => {
      pos._selected = _selected && !pos._disabled;
      return pos;
    });
    this.onGroupPositionSelected?.emit(item);
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  public isMixedSelected(item: any) {
    const isSomeSelected = item.positions.some(pos => pos._selected);
    return (item.positions.some(pos => !pos._selected) && isSomeSelected)
        || (isSomeSelected && item.positionsTotalCount > item.positions.length);
  }

  public changeParentCheckboxStatus(parentItem: any, item: any, event: boolean) {
    this.onPositionSelected?.emit(item);
    if (!parentItem) { return; }
    if (event) {
      parentItem._selected = true;
      if (parentItem?.positions?.every(pos => pos._selected) && parentItem?.positions?.length === parentItem.positionsTotalCount) {
        this.onGroupPositionSelected?.emit(parentItem);
      }
    } else {
      if (parentItem?.positions?.every(pos => !pos._selected)) {
        parentItem._selected = false;
        this.onGroupPositionSelected?.emit(parentItem);
      } else if (parentItem?.positions?.some(pos => !pos._selected)) {
        parentItem._selected = false;
        parentItem._preventUpdatePositions = true;
        this.onGroupPositionSelected?.emit(parentItem);
        parentItem._selected = true;
        parentItem._preventUpdatePositions = false;
      }
    }
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  public trackByFn(index: number) {
    return index;
  }

  public applyChanges() {
    this.isPopupVisible = false;
    this.columnHeaders = JSON.parse(JSON.stringify(this.clonedColumnHeaders));
    this.storage.set(this.STORAGE_KEY, this.visibleColumns).pipe(first()).subscribe();
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

  public discardChanges() {
    this.isPopupVisible = false;
    this.clonedColumnHeaders = JSON.parse(JSON.stringify(this.columnHeaders));
    setTimeout(_ => {
      this.cdr.detectChanges();
    });
  }

}
