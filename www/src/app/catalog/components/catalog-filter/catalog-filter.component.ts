import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { of, Subscription } from "rxjs";
import { debounceTime, filter, flatMap, switchMap, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { CatalogService } from "../../services/catalog.service";
import { CatalogCategoryFilter } from "../../models/catalog-category-filter";

@Component({
  selector: 'app-catalog-filter',
  templateUrl: 'catalog-filter.component.html',
  styleUrls: ['./catalog-filter.component.scss']
})

export class CatalogFilterComponent implements OnInit, OnDestroy {
  @Output() filter = new EventEmitter<CatalogCategoryFilter>();
  private subscription: Subscription = new Subscription();
  public priceRange = [0, 3000000];
  public productionTimeRange = [1, 365];

  public form = new FormGroup({
    'availability': new FormControl({value: true, disabled: true}),
    'price': new FormControl(this.priceRange),
    'productionTime': new FormControl(this.productionTimeRange),
    'contragents': new FormControl([]),
    'attributes': new FormArray([])
  });

  get attributes() {
    return this.form.get('attributes') as FormArray;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.route.params.pipe(
        flatMap(routeParams => {
          // Если у роута есть categoryId запрашиваем аттрибуты категории
          if (routeParams.categoryId) {
            return this.catalogService.getCategoryAttributes(routeParams.categoryId).pipe(
              // Проставляем их в форме
              tap(attributes => {
                attributes
                  .filter(attribute => attribute.values.length > 0)
                  .forEach(attribute => {
                  this.attributes.push(new FormGroup({
                    'label': new FormControl(attribute.name),
                    'values': new FormArray(attribute.values.map(
                      attributeValue => new FormGroup({
                        'id': new FormControl(attributeValue.id),
                        'value': new FormControl(attributeValue.value),
                        'checked': new FormControl(false)
                      })))
                  }));
                });
              }),
            );
          }
          return of(routeParams);
        }),
        // После того как проинициализировали форму, подписываемся на её изменения
        switchMap(() => this.form.valueChanges),
        // Пропускаем изменения которые чаще 500ms для разгрузки бэкенда
        debounceTime(500),
        filter(() => this.form.valid)
      ).subscribe(() => this.submit())
    );
  }

  public submit(): void {
    let price = this.form.value.price;
    let productionTime = this.form.value.productionTime === this.productionTimeRange ? [] : this.form.value.productionTime;

    if (price[0] === this.priceRange[0] && price[1] === this.priceRange[1]) {
      price = [];
    }

    if (productionTime[0] === this.productionTimeRange[0] && productionTime[1] === this.productionTimeRange[1]) {
      productionTime = [];
    }

    const contragents = this.form.value.contragents.map(contragent => contragent.id);
    const attributes = this.form.value.attributes

      // Оставляем только массивы с id значений аттрибутов
      .map(attribute => attribute.values.filter((value) => value.checked).map(value => value.id))
      // Преобразуем в единый массив
      .reduce((prev, curr) => [...prev, ...curr], []);

    this.filter.emit({attributes, contragents, price, productionTime});
  }

  public asFormArray(control: AbstractControl): FormArray {
    return control as FormArray;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
