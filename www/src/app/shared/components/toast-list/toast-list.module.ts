import { NgModule } from '@angular/core';
import { ToastComponent } from "./toast/toast.component";
import { NgxsModule } from "@ngxs/store";
import { ToastState } from "../../states/toast.state";
import { ToastListComponent } from "./toast-list.component";
import { CommonModule } from "@angular/common";
import { UxgModule } from "uxg";

@NgModule({
  imports: [
    UxgModule,
    CommonModule,
    NgxsModule.forFeature([
      ToastState
    ]),
  ],
  declarations: [ToastListComponent, ToastComponent],
  exports: [ToastListComponent, ToastComponent]
})
export class ToastListModule {
}
