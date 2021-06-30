import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { KimPriceOrder } from "../../../common/models/kim-price-order";
import { Select, Store } from "@ngxs/store";
import { PriceOrderActions } from "../../actions/price-order.actions";
import { Uuid } from "../../../../cart/models/uuid";
import { KimPriceOrderType } from "../../../common/enum/kim-price-order-type";
import { PaymentTermsLabels } from "../../../../request/common/dictionaries/payment-terms-labels";
import { KimPriceOrderTypeLabels } from "../../../common/dictionaries/kim-price-order-type-labels";
import { Observable, Subject } from "rxjs";
import { OkatoRegion } from "../../../../shared/models/okato-region";
import Create = PriceOrderActions.Create;
import { TextMaskConfig } from "angular2-text-mask/src/angular2TextMask";
import * as moment from "moment";
import { CartActions } from "../../actions/cart.actions";
import { CartState } from "../../states/cart.state";
import CreatePriceOrder = CartActions.CreatePriceOrder;
import { OkeiService } from "../../../../shared/services/okei.service";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { Router } from "@angular/router";
import { debounceTime, filter, flatMap, shareReplay, takeUntil, tap } from "rxjs/operators";
import { KimCartItem } from "../../../common/models/kim-cart-item";
import { StateStatus } from "../../../../request/common/models/state-status";
import { Okpd2Service } from "../../../../shared/services/okpd2.service";
import { OkatoService } from "../../../../shared/services/okato.service";
import { Okpd2 } from "../../../../shared/models/okpd2";

@Component({
  selector: 'app-kim-price-order-form',
  templateUrl: './price-order-form.component.html',
  styleUrls: ['./price-order-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PriceOrderFormComponent implements OnInit, OnDestroy {
  @Select(CartState.cartItems) orderPositions$: Observable<KimCartItem[]>;
  @Select(CartState.status) status$: Observable<StateStatus>;
  @Input() cartView = false;
  @Output() close = new EventEmitter();

  onOkatoInput = new Subject<string>();
  onOkpd2Input = new Subject<string>();

  form: FormGroup;
  isLoading: boolean;
  regions$: Observable<OkatoRegion[]>;
  okpd2List$: Observable<Okpd2[]>;
  readonly okeiList$ = this.okeiService.getOkeiList().pipe(shareReplay(1));
  readonly destroy$ = new Subject();
  readonly paymentTermsLabels = Object.entries(PaymentTermsLabels);
  readonly typeLabels = Object.entries(KimPriceOrderTypeLabels);
  readonly mask: TextMaskConfig = {
    mask: value => [/[0-2]/, value[0] === "2" ? /[0-3]/ : /[0-9]/, ' ', ':', ' ', /[0-5]/, /\d/],
    guide: false,
    keepCharPositions: true
  };
  readonly getRegionName = ({ name }) => name;
  readonly getOkeiName = ({ name }) => name;
  readonly getOkpd2Name = ({ name }) => name;

  get formPositions() {
    return this.form.get('positions') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    public okpd2Service: Okpd2Service,
    public okeiService: OkeiService,
    public okatoService: OkatoService,
    public router: Router
  ) {}

  ngOnInit() {
    this.regions$ = this.onOkatoInput.pipe(
      takeUntil(this.destroy$),
      filter(value => !!value.trim().length && value.length > 1),
      debounceTime(150),
      flatMap(value => this.okatoService.getRegionsList(value)));

    this.okpd2List$ = this.onOkpd2Input.pipe(
      takeUntil(this.destroy$),
      filter(value => !!value.trim().length && value.length > 1),
      debounceTime(150),
      flatMap(value => this.okpd2Service.getOkpd2List(value)));

    this.form = this.fb.group({
      name: ["", Validators.required],
      regions: ["", Validators.required],
      deliveryAddress: ["", Validators.required],
      deliveryConditions: ["", Validators.required],
      dateResponse: ["", [Validators.required]],
      dateDelivery: ["", Validators.required],
      type: [KimPriceOrderType.STANDART, Validators.required],
      isForSmallBusiness: false,
      isForProducer: false,
      isForAuthorizedDealer: false,
      isRussianProduction: false,
      isDenyMaxPricePosition: false,
      positions: this.fb.array([])
    });

    this.form.get('type').disable();

    if (!this.cartView) {
      this.pushPosition();
      this.form.get('positions').setValidators([Validators.required]);
    }
  }

  pushPosition() {
    this.formPositions.push(this.fb.group({
      name: ["", Validators.required],
      quantity: ["", [Validators.required, Validators.pattern("^[.0-9]+$"), Validators.min(0.0001)]],
      okei: ["", Validators.required],
      okpd2: ["", Validators.required],
      maxPrice: ["", [Validators.required, Validators.pattern("^[0-9]+$"), Validators.min(1)]]
    }));
  }

  submit() {
    const body: Partial<KimPriceOrder> & { id: Uuid } = this.form.value;
    body.dateResponse = moment(body.dateResponse, "DD.MM.YYYY HH:mm").toISOString();
    body.regions = this.form.value.regions.code;
    if (!this.cartView) {
      body.positions = this.form.get('positions').value.map(position => {
        position.okei = position.okei.code;
        position.okpd2 = position.okpd2.code;
        return position;
      });
    }
    this.form.disable();
    this.store.dispatch(this.cartView ? new CreatePriceOrder(body) : new Create(body))
      .pipe(tap(() => {
          this.store.dispatch(new ToastActions.Success('Ценовой запрос успешно создан'));
          this.form.enable();
          this.close.emit();
          this.router.navigate(["kim/customer/price-orders"]);
      }),
      takeUntil(this.destroy$))
      .subscribe();
  }

  isDateResponseInvalid(date: Date) {
    // Кол-во дней, начиная с текущего, с которого можно начинать выбрать дату
    let amount = 3;

    for (let i = 1; i <= amount; i++) {
      // Не учитываем выходные дни
      if (["6", "7"].includes(moment().add(i, 'd').format("E"))) { amount++; }
    }

    // Блокируем неугодные даты
    return !moment().add(amount, "d").startOf('day').isSameOrBefore(date);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
