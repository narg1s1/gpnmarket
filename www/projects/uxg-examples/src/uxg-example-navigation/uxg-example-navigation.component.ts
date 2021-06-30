import { of } from 'rxjs';
import { Component } from '@angular/core';

@Component({
  selector: 'uxg-example-navigation',
  templateUrl: './uxg-example-navigation.component.html'
})
export class UxgExampleNavigationComponent {

  readonly paginationExampleHTML = `<uxg-pagination [pages$]="pages$" [total]="100" [pageSize]="10" [siblingLimit]="2" (change)="onPageChanged($event)"></uxg-pagination>`;
  readonly paginationExampleJS = `
    export class FooComponent {
      // Observable выбранной страницы
      public pages$ = of(5);

      // Общее количество элементов
      public total = 100;

      // Размер страницы
      public pageSize = 10;

      // Сколько показывать страниц (слева/справа) от текущей
      public siblingLimit = 2;

      // Коллбэк выбора страницы
      onPageChanged(page: number) {}
  }`;

  public pages$ = of(5);

  public total = 100;

  public pageSize = 10;

  public siblingLimit = 2;

  public onPageChanged(page: number) {}

}
