import { Component, OnInit } from '@angular/core';
import { CatalogService } from "../../services/catalog.service";
import { CatalogPosition } from "../../models/catalog-position";
import { ActivatedRoute } from "@angular/router";
import { CatalogCategory } from "../../models/catalog-category";
import { Observable } from "rxjs";
import { CatalogCategoryFilter } from "../../models/catalog-category-filter";
import { Uuid } from "../../../cart/models/uuid";
import { tap } from "rxjs/operators";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-category-view',
  templateUrl: './category-view.component.html',
  styleUrls: ['./category-view.component.scss']
})
export class CategoryViewComponent implements OnInit {

  categoryId: Uuid;
  category$: Observable<CatalogCategory>;
  positions$: Observable<CatalogPosition[]>;
  categoryChilds$: Observable<CatalogCategory[]>;

  constructor(private catalogService: CatalogService, private route: ActivatedRoute, private title: Title) {}

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      this.categoryId = routeParams.categoryId;
      this.category$ = this.catalogService.getCategoryInfo(this.categoryId).pipe(
        tap(category => this.title.setTitle(category.name))
      );
      this.positions$ = this.catalogService.getPositionsList(this.categoryId);
      this.categoryChilds$ = this.catalogService.getCategoryChilds(this.categoryId);
    });
  }

  filter(filter: CatalogCategoryFilter) {
    this.positions$ = this.catalogService.getPositionsList(this.categoryId, filter);
  }
}
