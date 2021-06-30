import { UxgExampleDatepickerComponent } from './uxg-example-datepicker/uxg-example-datepicker';
import { UxgExampleNavigationComponent } from './uxg-example-navigation/uxg-example-navigation.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { UxgExampleDropdownComponent } from "./uxg-example-dropdown/uxg-example-dropdown.component";
import { UxgExampleIconsComponent } from "./uxg-example-icons/uxg-example-icons.component";
import { UxgExampleTabsComponent } from "./uxg-example-tabs/uxg-example-tabs.component";
import { UxgExampleControlsComponent, UxgRouterLinkActiveDirective } from "./uxg-example-controls/uxg-example-controls.component";
import { UxgExampleInputComponent } from "./uxg-example-input/uxg-example-input.component";
import { UxgExampleTypographyComponent } from "./uxg-example-typography/uxg-example-typography.component";
import { UxgModule } from "uxg";
import { UxgExampleHomeComponent } from './uxg-example-home/uxg-example-home.component';
import { UxgExamplePopoverComponent } from './uxg-example-popover/uxg-example-popover.component';
import { UxgExampleWizzardComponent } from "./uxg-example-wizzard/uxg-example-wizzard.component";


@NgModule({
  declarations: [
    AppComponent,
    UxgExampleDropdownComponent,
    UxgExampleIconsComponent,
    UxgExampleTabsComponent,
    UxgExampleControlsComponent,
    UxgExampleInputComponent,
    UxgExampleTypographyComponent,
    UxgRouterLinkActiveDirective,
    UxgExampleHomeComponent,
    UxgExamplePopoverComponent,
    UxgExampleWizzardComponent,
    UxgExampleNavigationComponent,
    UxgExampleDatepickerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UxgModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
