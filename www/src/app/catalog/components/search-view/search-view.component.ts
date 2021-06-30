import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CatalogService } from "../../services/catalog.service";
import { CatalogPosition } from "../../models/catalog-position";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { CatalogCategoryFilter } from "../../models/catalog-category-filter";
import { FeatureService } from "../../../core/services/feature.service";
import { takeUntil } from "rxjs/operators";
import { UxgModalComponent } from "uxg";

@Component({
  selector: 'app-catalog-search-view',
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.scss']
})
export class SearchViewComponent implements OnInit, OnDestroy {
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  positions$: Observable<CatalogPosition[]>;
  query: string;
  destroy$ = new Subject();
  public templateFiles: File[] = [];
  public templateLoading: boolean;

  constructor(
    private route: ActivatedRoute,
    public featureService: FeatureService,
    public catalogService: CatalogService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(routeParams => {
      this.query = routeParams.q;
      this.positions$ = this.catalogService.searchPositionsByName(this.query);
    });
  }

  filter(filter: CatalogCategoryFilter) {
    this.positions$ = this.catalogService.searchPositionsByName(this.query, filter);
  }

  uploadTemplate() {
    this.templateLoading = true;
    this.catalogService.uploadTemplate(this.templateFiles)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.uploadTemplateModal.close();
        this.templateLoading = false;
        this.positions$ = this.catalogService.searchPositionsByName(this.query);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
