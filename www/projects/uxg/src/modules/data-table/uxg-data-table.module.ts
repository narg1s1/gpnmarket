import { UxgPaginationModule } from './../pagination/uxg-pagination.module';
import { FormsModule } from '@angular/forms';
import { UxgButtonModule } from './../button/uxg-button.module';
import { UxgModalModule } from './../modal/uxg-modal.module';
import { UxgCheckboxModule } from './../checkbox/uxg-checkbox.module';
import { UxgIconModule } from './../icon/uxg-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UxgDataTableComponent } from './uxg-data-table.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UxgIconModule,
    UxgCheckboxModule,
    UxgModalModule,
    UxgButtonModule,
    UxgPaginationModule
  ],
  declarations: [UxgDataTableComponent],
  exports: [UxgDataTableComponent],
})
export class UxgDataTableModule { }
