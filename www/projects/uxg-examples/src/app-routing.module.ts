import { UxgExampleDatepickerComponent } from './uxg-example-datepicker/uxg-example-datepicker';
import { UxgExampleNavigationComponent } from './uxg-example-navigation/uxg-example-navigation.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UxgExampleTypographyComponent } from "./uxg-example-typography/uxg-example-typography.component";
import { UxgExampleControlsComponent } from "./uxg-example-controls/uxg-example-controls.component";
import { UxgExampleDropdownComponent } from "./uxg-example-dropdown/uxg-example-dropdown.component";
import { UxgExampleInputComponent } from "./uxg-example-input/uxg-example-input.component";
import { UxgExampleTabsComponent } from "./uxg-example-tabs/uxg-example-tabs.component";
import { UxgExampleIconsComponent } from "./uxg-example-icons/uxg-example-icons.component";
import { UxgExampleHomeComponent } from "./uxg-example-home/uxg-example-home.component";
import { UxgExamplePopoverComponent } from "./uxg-example-popover/uxg-example-popover.component";
import { UxgExampleWizzardComponent } from "./uxg-example-wizzard/uxg-example-wizzard.component";


const routes: Routes = [
  {
    path: "",
    component: UxgExampleHomeComponent,
    data: { title: 'Home' }
  },
  {
    path: "grid-and-typography",
    component: UxgExampleTypographyComponent,
    data: { title: 'Grid and typography' }
  },
  {
    path: "control",
    component: UxgExampleControlsComponent,
    data: { title: 'Controls' }
  },
  {
    path: "input",
    component: UxgExampleInputComponent,
    data: { title: 'Inputs' }
  },
  {
    path: "dropdown",
    component: UxgExampleDropdownComponent,
    data: { title: 'Dropdowns' }
  },
  {
    path: "tab",
    component: UxgExampleTabsComponent,
    data: { title: 'Tabs' }
  },
  {
    path: "popover",
    component: UxgExamplePopoverComponent,
    data: { title: 'Popover' }
  },
  {
    path: "wizzard",
    component: UxgExampleWizzardComponent,
    data: { title: 'Wizzard' }
  },
  {
    path: "icon",
    component: UxgExampleIconsComponent,
    data: { title: 'Icons' }
  },
  {
    path: "navigation",
    component: UxgExampleNavigationComponent,
    data: { title: 'Navigation' }
  },
  {
    path: "datepicker",
    component: UxgExampleDatepickerComponent,
    data: { title: 'Datepicker' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
