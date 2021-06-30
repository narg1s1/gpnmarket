import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CatalogCategory } from "../../models/catalog-category";
import { CatalogService } from "../../services/catalog.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-catalog-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categories: CatalogCategory[];
  selectedMainCategory: CatalogCategory;

  @Input() opened = false;
  @Output() openedChange = new EventEmitter<boolean>();

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.getCategoriesTree();
  }

  getCategoriesTree(): void {
    this.catalogService.getCategoriesTree().subscribe(
      (categories: CatalogCategory[]) => {
        this.categories = categories;
        this.selectedMainCategory = this.categories[0];
      }
    );
  }

  onMainCategorySelect(category: CatalogCategory) {
    this.selectedMainCategory = category;
  }

  onCategoryClick() {
    this.openedChange.emit(false);
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.openedChange.emit(false);
  }
}
