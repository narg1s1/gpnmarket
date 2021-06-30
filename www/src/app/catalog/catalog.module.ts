import { NgModule } from '@angular/core';
import { CatalogRoutingModule } from './catalog-routing.module';
import { SharedModule } from "../shared/shared.module";
import { CatalogService } from "./services/catalog.service";
import { CategoryViewComponent } from './components/category-view/category-view.component';
import { SearchPanelComponent } from "./components/search-panel/search-panel.component";
import { SearchViewComponent } from "./components/search-view/search-view.component";
import { PositionsListComponent } from "./components/positions-list/positions-list.component";
import { CategoriesComponent } from './components/categories/categories.component';
import { CatalogComponent } from "./components/catalog/catalog.component";
import { CatalogFilterComponent } from "./components/catalog-filter/catalog-filter.component";
import { CheckboxSliderControlComponent } from "./controls/checkbox-slider/checkbox-slider.control";
import { ReactiveFormsModule } from "@angular/forms";
import { RangeSliderControlComponent } from "./controls/range-slider/range-slider.control";
import { NouisliderModule } from "ng2-nouislider";
import { PositionViewComponent } from './components/position-view/position-view.component';
import { SupplierAutocompleteControlComponent } from "./controls/supplier-autocomplete/supplier-autocomplete.control";

@NgModule({
  declarations: [
    CatalogComponent,
    SearchViewComponent,
    CategoryViewComponent,

    PositionsListComponent,
    SearchPanelComponent,
    CategoriesComponent,
    PositionViewComponent,
    CatalogFilterComponent,
    CheckboxSliderControlComponent,
    RangeSliderControlComponent,
    SupplierAutocompleteControlComponent,
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    CatalogRoutingModule,
    NouisliderModule
  ],
  providers: [
    CatalogService
  ]
})
export class CatalogModule {
}
