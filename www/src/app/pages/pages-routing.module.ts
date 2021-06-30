import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForbiddenComponent } from "./forbidden/forbidden.component";
import { NotFoundComponent } from "./not-found/not-found.component";

const routes: Routes = [
  { path: 'forbidden', component: ForbiddenComponent, data: {title: "403 - Доступ запрещен"} },
  { path: 'not-found', component: NotFoundComponent, data: {title: "404 - Страница не найдена"} }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class PagesRoutingModule {

  constructor() {
  }
}
