import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartStoreService } from '../../services/cart-store.service';
import { OrderFormInfo } from '../../models/order-form-info';
import { Router } from '@angular/router';
import { CartService } from "../../services/cart.service";
import { FormControl, FormGroup } from "@angular/forms";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { Subscription } from "rxjs";
import { ClrLoadingState } from "@clr/angular";

@Component({
  selector: 'cart-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnDestroy {

  private subscription = new Subscription();
  public loadingState = ClrLoadingState.DEFAULT;
  public form = new FormGroup({
    'requestName': new FormControl('', [CustomValidators.requiredNotEmpty]),
    'deliveryDate': new FormControl(null, CustomValidators.futureDate()),
    'deliveryBasis': new FormControl(null, [CustomValidators.requiredNotEmpty]),
    'paymentTerms': new FormControl('30 дней по факту поставки', [CustomValidators.requiredNotEmpty]),
  });

  constructor(
    private cartStore: CartStoreService,
    private cart: CartService,
    private router: Router
  ) {
  }

  isQuantityInvalid(): boolean {
    return this.cartStore.getItems().filter(item => item.quantity <= 0).length > 0;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const orderFormInfo = new OrderFormInfo(this.form.value);
    this.loadingState = ClrLoadingState.LOADING;

    this.subscription.add(
      this.cart.sendOrder(orderFormInfo)
        .subscribe(data => {
          this.cartStore.clear();
          this.loadingState = ClrLoadingState.SUCCESS;
          this.router.navigateByUrl(`requests/customer/${data.id}`);
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
