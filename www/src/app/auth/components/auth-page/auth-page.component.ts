import { Component } from '@angular/core';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {

  constructor(public title: Title) { }

}
