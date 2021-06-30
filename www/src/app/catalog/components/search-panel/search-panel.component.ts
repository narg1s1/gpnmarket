import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { CatalogPosition } from "../../models/catalog-position";
import { CatalogService } from "../../services/catalog.service";
import { Observable } from "rxjs";
import { SearchResults } from "../../models/search-results";
import { CatalogCategory } from "../../models/catalog-category";

@Component({
  selector: 'app-catalog-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
})
export class SearchPanelComponent implements AfterViewInit, OnDestroy {
  @Input() searchText: string;
  @Output() searchTextChange = new EventEmitter<string>();
  @ViewChild('searchPanel') searchPanel: ElementRef;

  showSearchResults = false;
  searchResults$: Observable<SearchResults>;

  categoriesOpened = false;

  private wasInside = false;

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickOut() {
    if (!this.wasInside) {
      this.showSearchResults = false;
    }
    this.wasInside = false;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    protected router: Router,
    protected catalogService: CatalogService
  ) {
  }

  ngAfterViewInit() {
    const contentEl = this.document.querySelector('.app-content');
    contentEl.parentElement.insertBefore(this.searchPanel.nativeElement, contentEl);
  }

  // todo подсказки временно отключили
  onShowSearchSuggestions() {
    this.searchResults$ = this.catalogService.searchSuggestions(this.searchText, 10, 10);
    this.showSearchResults = true;
  }

  onSearch() {
    this.showSearchResults = false;
    this.searchTextChange.emit(this.searchText);
  }

  onResetClick() {
    this.searchText = '';
    this.showSearchResults = false;
    this.searchTextChange.emit(this.searchText);
  }

  onCategoryClick(category: CatalogCategory) {
    this.showSearchResults = false;
    this.router.navigate(['catalog', category.id], {replaceUrl: true});
  }

  onPositionClick(position: CatalogPosition) {
    this.showSearchResults = false;
    this.router.navigate(['catalog/position', position.id], {replaceUrl: true});
  }

  onToggleCategories() {
    this.categoriesOpened = !this.categoriesOpened;
  }

  ngOnDestroy() {
    this.searchPanel.nativeElement.remove();
  }
}
