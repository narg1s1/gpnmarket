import { Component } from '@angular/core';
import { UxgBreadcrumbsService } from "uxg";

@Component({
  selector: 'uxg-example-typography',
  templateUrl: './uxg-example-typography.component.html',
  styleUrls: ['./uxg-example-typography.component.scss']
})
export class UxgExampleTypographyComponent {
  constructor(public breadcrumbsService: UxgBreadcrumbsService) {
    // Here is generating breadcrumbs logic ...
    this.breadcrumbsService.breadcrumbs = [
      { label: "Home", link: "/" },
      { label: "Page1", link: "/page1" },
      { label: "Page2", link: "/page1" }
    ];
  }

gridWithBorder = true;

  readonly example1 = `<h1>Sample title</h1>
<h2>Sample title</h2>
<h3>Sample title</h3>
<h4>Sample title</h4>
<p>Sed ut perspiciatis unde omnis ... beatae vitae dicta sunt explicabo.</p>
<small>Sample small text</small>
<p class="app-secondary-color">Secondary font color</p>
<p class="app-ghost-color">Ghost font color</p>
<p><a [routerLink]="...">Simple link</a></p>
<p class="app-success-color app-row app-align-items-center">
  <uxg-icon shape="app-check"></uxg-icon>
  <span>Success font color</span>
</p>
<p class="app-warning-color app-row app-align-items-center">
  <uxg-icon shape="app-info"></uxg-icon>
  <span>Warning font color</span>
</p>
<p class="app-alert-color app-row app-align-items-center">
  <uxg-icon shape="app-warning"></uxg-icon>
  <span>Alert font color</span>
</p>
`;
  readonly example2 = `
<!-- Main container -->
<div class="app-main">
  Main container
</div>
<!-- Example with right aside -->
<div class="app-row">
  <div class="app-col">Main column</div>
  <div class="app-col app-col-aside">Aside column</div>
</div>

<!-- Example with left aside -->
<div class="app-row">
  <div class="app-col">Main column</div>
  <div class="app-col app-col-aside">Aside column</div>
</div>

<!-- Example with both asides -->
<div class="app-row">
  <div class="app-col app-col-aside">Aside column</div>
  <div class="app-col">Main column</div>
  <div class="app-col app-col-aside">Aside column</div>
</div>
`;
  readonly example3 = `<div class="app-row">
  <div class="app-col app-bold">ID</div>
  <div class="app-col app-bold">Name</div>
  <div class="app-col app-bold">Age</div>
</div>
<div class="app-row">
  <div class="app-col">1</div>
  <div class="app-col">Mike</div>
  <div class="app-col">21</div>
</div>
<div class="app-row">
  <div class="app-col">2</div>
  <div class="app-col">Jhon</div>
  <div class="app-col">24</div>
</div>
<div class="app-row">
  <div class="app-col">3</div>
  <div class="app-col">Alice</div>
  <div class="app-col">19</div>
</div>`;

  get example4() {
    return `<div class="app-table${this.gridWithBorder ? "" : " app-no-border"}">
  <div class="app-row">
    <div class="app-col">1</div>
    <div class="app-col">Mike</div>
    <div class="app-col">21</div>
  </div>
  <div class="app-row">
    <div class="app-col">2</div>
    <div class="app-col">Jhon</div>
    <div class="app-col">24</div>
  </div>
  <div class="app-row">
    <div class="app-col">3</div>
    <div class="app-col">Alice</div>
    <div class="app-col">19</div>
  </div>
</div>`;
  }
  readonly example6 = `<uxg-breadcrumbs [breadcrumbs]="breadcrumbsService.breadcrumbs"></uxg-breadcrumbs>`;
  readonly example6_1 = `constructor(public breadcrumbsService: UxgBreadcrumbsService) {
  // Here is generating breadcrumbs logic ...
  this.breadcrumbsService.breadcrumbs = [
    { label: "Home", link: "/" },
    { label: "Page1", link: "/page1" },
    { label: "Page2", link: "/page1" }
  ];
}`;
}
