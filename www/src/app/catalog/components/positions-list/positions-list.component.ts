import { Component, Input, OnChanges } from '@angular/core';
import { CatalogService } from "../../services/catalog.service";
import { CatalogPosition } from "../../models/catalog-position";
import { CartStoreService } from "../../../cart/services/cart-store.service";
import { Router } from "@angular/router";
import { ContragentInfo } from "../../../contragent/models/contragent-info";
import { ContragentService } from "../../../contragent/services/contragent.service";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { FeatureService } from "../../../core/services/feature.service";

@Component({
  selector: 'app-catalog-positions-list',
  templateUrl: './positions-list.component.html',
  styleUrls: ['./positions-list.component.scss']
})
export class PositionsListComponent implements OnChanges {
  @Input() positions: CatalogPosition[];
  form = new FormGroup({});
  contragent: ContragentInfo;
  loadingState = false;
  thisButtonIndex: number;

  constructor(
    public featureService: FeatureService,
    private getContragentService: ContragentService,
    private catalogService: CatalogService,
    private cartStoreService: CartStoreService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  get formPositions(): FormArray {
    return this.form.get('positions') as FormArray;
  }

  ngOnChanges() {
    this.form.removeControl("positions");
    this.form.addControl("positions", this.fb.array(
      this.positions.map(position => {
        const formGroup = this.fb.group({
          position: [position, this.positionInCartValidator],
          quantity: [1, [Validators.required, Validators.min(0.01)]],
        });

        if (formGroup.get('position').hasError('inCart')) {
          formGroup.get('quantity').disable();
        }

        return formGroup;
      })
    ));
  }

  addToCart(formGroup: AbstractControl, index) {
    this.loadingState = true;
    this.thisButtonIndex = index;

    const { position, quantity } = formGroup.value;
    this.cartStoreService.addItem(position, quantity).finally(() => {
      formGroup.get('position').updateValueAndValidity();
      this.loadingState = false;
      this.thisButtonIndex = null;
    });
  }

  positionInCartValidator = (control: AbstractControl): ValidationErrors => {
    return this.cartStoreService.isCatalogPositionInCart(control.value) ? { inCart: true } : null;
  }

  setValidQuantity(value, quantityEl): void {
    if (value <= 0 || value === "") {
      quantityEl.value = 1;
    }
  }
}
