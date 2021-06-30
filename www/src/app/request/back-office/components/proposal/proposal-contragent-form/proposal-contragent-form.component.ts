import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ContragentList } from "../../../../../contragent/models/contragent-list";
import { shareReplay } from "rxjs/operators";
import { ContragentService } from "../../../../../contragent/services/contragent.service";
import { Store } from "@ngxs/store";
import { Request } from "../../../../common/models/request";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";
import { PositionCurrency } from "../../../../common/enum/position-currency";
import { DeliveryType } from "../../../enum/delivery-type";
import { DeliveryTypeLabels } from "../../../../common/dictionaries/delivery-type-labels";
import { CurrencyLabels } from "../../../../common/dictionaries/currency-labels";
import { getCurrencySymbol } from "@angular/common";
import { Uuid } from "../../../../../cart/models/uuid";
import { searchContragents } from "../../../../../shared/helpers/search";
import { CommonProposal } from "../../../../common/models/common-proposal";
import { ProposalSourceLabels } from "../../../../common/dictionaries/proposal-source-labels";
import { ProposalSource } from "../../../enum/proposal-source";


@Component({
  selector: 'common-proposal-contragent-form',
  templateUrl: 'proposal-contragent-form.component.html',
  styleUrls: ['./proposal-contragent-form.component.scss'],
})
export class ProposalContragentFormComponent implements OnInit {
  @Input() request: Request;
  @Input() groupId: Uuid;
  @Input() source: ProposalSource;
  @Input() selectedContragents: ContragentShortInfo[];
  @Input() proposal: CommonProposal;
  @Output() close = new EventEmitter();
  @Output() create = new EventEmitter<Partial<CommonProposal>>();
  @Output() edit = new EventEmitter<Partial<CommonProposal> & { id: Uuid }>();
  readonly deliveryType = DeliveryType;
  readonly deliveryTypeLabel = DeliveryTypeLabels;
  readonly deliveryTypes = Object.entries(DeliveryTypeLabels);
  readonly currencies = Object.entries(CurrencyLabels);
  readonly getCurrencySymbol = getCurrencySymbol;
  readonly sourceLabel = ProposalSourceLabels;
  readonly contragents$ = this.contragentService.getContragentList().pipe(shareReplay(1));
  readonly searchContragents = searchContragents;
  form: FormGroup;
  invalidDocControl = false;

  constructor(
    private contragentService: ContragentService,
    private fb: FormBuilder,
    private store: Store,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      supplier: [this.proposal?.supplier ?? null, Validators.required],
      files: [[]],
      documents: [this.defaultValue('documents', [])],
      deliveryType: [this.proposal?.deliveryType ?? this.deliveryType.INCLUDED],
      deliveryAdditionalTerms: [this.proposal?.deliveryAdditionalTerms ?? ''],
      warrantyConditions: [this.proposal?.warrantyConditions ?? '', Validators.required],
      deliveryPrice: [this.proposal?.deliveryPrice ?? ''],
      deliveryCurrency: [PositionCurrency.RUB],
      deliveryPickup: [this.proposal?.deliveryPickup ?? '']
    });

    if (this.proposal) {
      this.form.addControl("id", this.fb.control(this.defaultValue('id', null)));
    }

    this.form.get('deliveryType').valueChanges.subscribe((type: DeliveryType) => {
      this.form.get('deliveryPickup').setValidators(type === this.deliveryType.PICKUP ? [Validators.required] : null);
      this.form.get('deliveryPickup').updateValueAndValidity();

      this.form.get('deliveryPrice').setValidators(type === this.deliveryType.NOT_INCLUDED ? [Validators.required] : null);
      this.form.get('deliveryPrice').updateValueAndValidity();
    });
    this.cd.detectChanges();
  }

  contragentExists(contragent) {
    return this.selectedContragents.some(({id}) => id === contragent.id);
  }

  submit() {
    if (this.form.valid) {
      const files = this.form.get('files').value.filter(({ valid }) => valid).map(({ file }) => file);
      const event: Partial<CommonProposal> =  {
        ...this.form.value,
        supplierId: this.form.value.supplier.id,
        files
      };

      delete event.supplier;

      this.proposal ? this.edit.emit(event as Partial<CommonProposal> & { id: Uuid }) : this.create.emit(event);
      this.close.emit();
    }
  }

  defaultValue = (field: keyof CommonProposal, defaultValue: any = "") => this.proposal && this.proposal[field] || defaultValue;
  getContragentName = ({ shortName, fullName }: ContragentList) => shortName || fullName;
}
