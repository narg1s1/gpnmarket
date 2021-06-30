import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryViewComponent } from "./components/category-view/category-view.component";
import { SearchViewComponent } from "./components/search-view/search-view.component";
import { CatalogComponent } from "./components/catalog/catalog.component";
import { PositionViewComponent } from "./components/position-view/position-view.component";
import { CanActivateFeatureGuard } from "../core/can-activate-feature.guard";

const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { feature: "catalog" },
    children: [
      {
        path: '',
        redirectTo: 'search'
      },
      {
        path: 'search',
        component: SearchViewComponent,
        data: { title: "Каталог", hideTitle: true, hideBreadcrumbs: true }
      },
      {
        path: ':categoryId',
        component: CategoryViewComponent,
        data: { hideTitle: true, hideBreadcrumbs: true }
      },
      {
        path: 'position/:positionId',
        component: PositionViewComponent,
        data: { hideTitle: true, hideBreadcrumbs: true }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule {
}
