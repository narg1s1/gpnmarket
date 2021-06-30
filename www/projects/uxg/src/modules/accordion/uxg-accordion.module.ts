import { UxgIconModule } from './../icon/uxg-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UxgAccordionComponent } from './uxg-accordion.component';

@NgModule({
  imports: [
    CommonModule,
    UxgIconModule
  ],
  declarations: [UxgAccordionComponent],
  exports: [UxgAccordionComponent],
})
export class UxgAccordionModule { }
