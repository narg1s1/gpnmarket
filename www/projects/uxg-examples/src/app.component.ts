import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'uxg-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  readonly menu = this.router.config
    .filter(route => route.data && route.data.title)
    .map(route => ({path: route.path, title: route.data.title}));

  constructor(private router: Router) {}
}
