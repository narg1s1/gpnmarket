import { NgModule } from '@angular/core';
import { UxgFilterModule } from 'projects/uxg/src/modules/filter/uxg-filter.module';
import { RequestRoutingModule } from "./request-routing.module";

@NgModule({
  imports: [
    RequestRoutingModule,
    UxgFilterModule,
  ]
})
export class RequestModule {
}
