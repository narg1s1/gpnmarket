import { Component, Input } from '@angular/core';
import { UxgBreadcrumbs } from "./uxg-breadcrumbs";

@Component({
  selector: 'uxg-breadcrumbs',
  templateUrl: './uxg-breadcrumbs.component.html'
})
export class UxgBreadcrumbsComponent {
  @Input() breadcrumbs: UxgBreadcrumbs;
}
