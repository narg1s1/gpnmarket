import { NgModule } from '@angular/core';
import { NotFoundComponent } from './not-found/not-found.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { PagesRoutingModule } from "./pages-routing.module";

@NgModule({
  imports: [
    PagesRoutingModule
  ],
  declarations: [
    NotFoundComponent,
    ForbiddenComponent
  ],
})
export class PagesModule { }
