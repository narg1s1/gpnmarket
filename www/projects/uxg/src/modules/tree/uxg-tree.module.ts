import { NgModule } from '@angular/core';
import { UxgTreeComponent, UxgTreeNodeDirective, UxgTreeWrapDirective } from "./uxg-tree.component";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [CommonModule],
  declarations: [UxgTreeComponent, UxgTreeNodeDirective, UxgTreeWrapDirective],
  exports: [UxgTreeComponent, UxgTreeNodeDirective, UxgTreeWrapDirective],
})
export class UxgTreeModule {
}
