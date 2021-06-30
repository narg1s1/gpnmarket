import { NgModule } from '@angular/core';
import { UxgBreadcrumbsComponent } from "./uxg-breadcrumbs.component";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UxgIconModule } from "../icon/uxg-icon.module";


@NgModule({
  imports: [CommonModule, RouterModule, UxgIconModule],
  declarations: [UxgBreadcrumbsComponent],
  exports: [UxgBreadcrumbsComponent],
})
export class UxgBreadcrumbsModule {
}
