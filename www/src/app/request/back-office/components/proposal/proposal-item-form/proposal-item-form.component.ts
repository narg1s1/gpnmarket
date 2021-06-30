import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { CommonProposalItem } from "../../../../common/models/common-proposal";
import { RequestPosition } from "../../../../common/models/request-position";
import { CurrencyLabels } from "../../../../common/dictionaries/currency-labels";
import { PaymentTermsLabels } from "../../../../common/dictionaries/payment-terms-labels";
import { shareReplay, takeUntil } from "rxjs/operators";
import { OkeiService } from "../../../../../shared/services/okei.service";
import { PositionCurrency } from "../../../../common/enum/position-currency";
import { CustomValidators } from "../../../../../shared/forms/custom.validators";
import { DatePipe } from "@angular/common";
import { ProposalSource } from "../../../enum/proposal-source";
import { Okei } from "../../../../../shared/models/okei";

@Component({
  selector: 'app-proposal-item-form',
  templateUrl: './proposal-item-form.component.html',
  styleUrls: ['./proposal-item-form.component.scss'],
  providers: [DatePipe]
})
export class ProposalItemFormComponent extends OnDestroyDirective implements OnInit {

  @Input() position: RequestPosition;
  @Input() proposalItem: CommonProposalItem;
  @Input() source: ProposalSource;
  @Input() tradingScheme: 'TRADE' | 'AGENT';
  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter<Partial<CommonProposalItem>>();

  readonly currencies = Object.entries(CurrencyLabels);
  readonly paymentTerms = Object.entries(PaymentTermsLabels);
  readonly okeiList$ = this.okeiService.getOkeiList().pipe(shareReplay(1));
  readonly form = this.fb.group({
    id: null,
    requestPositionId: null,
    priceWithoutVat: [null, Validators.required],
    quantity: [null, [Validators.required, Validators.pattern("^[.0-9]+$"), Validators.min(0.0001)]],
    measureUnit: [null, Validators.required],
    okeiCode: [null],
    currency: [PositionCurrency.RUB, Validators.required],
    deliveryDate: [null, CustomValidators.futureDate()],
    manufacturer: [null, Validators.required],
    standard: [null],
    paymentTerms: [null, Validators.required],
    increaseType: [null],
    increaseValue: [null, [Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$")]]
  });

  constructor(
    private fb: FormBuilder,
    public okeiService: OkeiService,
    public datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    const { id, ...position }: RequestPosition = this.position;
    this.form.patchValue({
      ...{
        requestPositionId: id,
        manufacturingName: position?.name,
        priceWithoutVat: this.position?.startPrice
      },
      ...position ?? {},
      ...this.proposalItem ?? {},
      ...{ deliveryDate: this.parseDate(this.proposalItem?.deliveryDate ?? this.position.deliveryDate) },
      increaseType: this.proposalItem?.increase?.type || null,
      increaseValue: this.proposalItem?.increase?.value || null,
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.form.patchValue({
            okeiCode: this.form.value.measureUnit?.code ?? this.form.value.okeiCode,
            measureUnit: this.form.value.measureUnit?.symbol ?? this.form.value.measureUnit,
          }, {emitEvent: false});
        });

    this.form.get('increaseType')
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((increaseType: string) => {
        this.form.get('increaseValue').reset();
        this.form.get('increaseValue').setValidators([
          Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$"),
          (increaseType === 'RELATIVE')
            ? CustomValidators.increaseValuePercent
            : CustomValidators.increaseValueAbsolute(this.form.get('priceWithoutVat').value)
        ]);
        this.form.get('increaseValue').updateValueAndValidity();
      });

    this.form.get('currency').disable();

    if (this.source === 'TECHNICAL_COMMERCIAL_PROPOSAL') {
      this.form.addControl('manufacturingName', this.fb.control(this.proposalItem?.manufacturingName ?? this.position.name, Validators.required));
    }
  }


  submit() {
    if (this.form.invalid) { return; }

    this.save.emit(this.form.getRawValue());
    this.close.emit();
  }

  private parseDate(date: string) {
    if (!date) { return null; }

    try {
      return this.datePipe.transform(new Date(date), 'dd.MM.yyyy');
    } catch (e) {
      return date;
    }
  }

  getOkeiSymbol = ({symbol}: Okei) => symbol && symbol.toLowerCase();
}
