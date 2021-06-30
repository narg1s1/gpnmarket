import { Component, Input, OnInit } from '@angular/core';
import { Uuid } from "../../../../cart/models/uuid";
import { CommercialProposalsService } from "../../../back-office/services/commercial-proposals.service";
import { ActivatedRoute } from "@angular/router";
import { RequestOfferPosition } from "../../models/request-offer-position";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PositionStatus } from "../../enum/position-status";
import { RequestPosition } from "../../models/request-position";
import { RequestDocument } from "../../models/request-document";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { Store } from "@ngxs/store";
import { PositionStatuses } from '../../dictionaries/position-statuses';
import { RequestService } from "../../../customer/services/request.service";
import { ContragentInfo } from "../../../../contragent/models/contragent-info";
import { ContragentService } from "../../../../contragent/services/contragent.service";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { CommercialProposalsDeprecatedService } from "../../../back-office/services/commercial-proposals-deprecated.service";

@Component({
  selector: 'app-request-commercial-proposal-list-deprecated',
  templateUrl: './commercial-proposal-list-deprecated.component.html',
  styleUrls: ['./commercial-proposal-list-deprecated.component.css']
})
export class CommercialProposalListDeprecatedComponent implements OnInit {
  @Input() requestPosition: RequestPosition;
  @Input() isCustomerView: boolean;
  @Input() requestId: Uuid;

  contragent: ContragentInfo;
  contragentInfoModalOpened = false;

  offer: RequestOfferPosition;
  offerWinnerId: Uuid;

  offerForm: FormGroup;
  showAddOfferForm = false;

  constructor(
    protected offersService: CommercialProposalsDeprecatedService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private customerRequestService: RequestService,
    private store: Store,
    protected getContragentService: ContragentService,
  ) {
  }

  ngOnInit() {
    this.offerForm = this.formBuilder.group({
      supplierContragentName: ['', Validators.required],
      priceWithVat: ['', [Validators.required, Validators.min(1)]],
      currency: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.0001), Validators.pattern("^[.0-9]+$")]],
      measureUnit: ['', Validators.required],
      deliveryDate: ['', [Validators.required, CustomValidators.futureDate()]],
      paymentTerms: ['', Validators.required]
    });

    const winnerOffer = this.findDefaultOffer();
    if (winnerOffer) {
      this.offerWinnerId = winnerOffer.id;
    }
  }

  isNotActual(position: RequestPosition): boolean {
    return position.status === PositionStatus.CANCELED ||
           position.status === PositionStatus.NOT_RELEVANT ||
           position.status === PositionStatus.RESULTS_AGREEMENT ||
           position.status === PositionStatus.WINNER_SELECTED;
  }

  findDefaultOffer() {
    const winner = this.findWinnerOffer();
    if (winner) {
      return winner;
    }
    return this.findMinPriceOffer();
  }

  findMinPriceOffer() {
    for (let i = 0; i < this.requestPosition.linkedOffers.length; i++) {
      if (this.requestPosition.linkedOffers[i].isMinPrice === true) {
        return this.requestPosition.linkedOffers[i];
      }
    }
    return null;
  }

  findWinnerOffer() {
    for (let i = 0; i < this.requestPosition.linkedOffers.length; i++) {
      if (this.requestPosition.linkedOffers[i].isWinner === true) {
        return this.requestPosition.linkedOffers[i];
      }
    }
    return null;
  }

  isFieldValid(field: string) {
    return this.offerForm.get(field).errors
      && (this.offerForm.get(field).touched || this.offerForm.get(field).dirty);
  }

  onShowAddOfferForm() {
    this.showAddOfferForm = !this.showAddOfferForm;
  }

  canChoiceWinner() {
    return this.requestPosition.status === PositionStatus.RESULTS_AGREEMENT;
  }

  onUploadDocuments(files: File[], offer: RequestOfferPosition) {
    this.offersService.uploadDocuments(offer, files)
      .subscribe((documents: RequestDocument[]) => {
        documents.forEach(document => offer.documents.push(document));
        this.store.dispatch(new ToastActions.Success('Документ загружен'));
      });
  }

  onUploadTechnicalProposals(files: File[], offer: RequestOfferPosition) {
    this.offersService.uploadTechnicalProposals(offer, files)
      .subscribe((documents: RequestDocument[]) => {
        documents.forEach(document => offer.technicalProposals.push(document));
        this.store.dispatch(new ToastActions.Success('Документ загружен'));
      });
  }

  canUploadTp(): boolean {
    if (this.isCustomerView) {
      return false;
    }
    const currentStatus = this.requestPosition.status;
    const currentStatusIndex = PositionStatuses.indexOf(currentStatus);
    if (currentStatusIndex < 0) {
      return false;
    }
    const resultsAgreementIndex = PositionStatuses.indexOf(
      PositionStatus.RESULTS_AGREEMENT
    );
    return currentStatusIndex <= resultsAgreementIndex;
  }

  canUploadKp(): boolean {
    return this.canUploadTp();
  }

  onChoiceWinner(offerWinner: RequestOfferPosition) {
    this.customerRequestService.choiceWinner(offerWinner.id, this.requestPosition.id, this.requestId).subscribe(
      (data: any) => {
        this.requestPosition.status = data.status;
        this.requestPosition.statusLabel = data.statusLabel;
        offerWinner.isWinner = true;

        this.store.dispatch(new ToastActions.Success('Победитель выбран'));
      }
    );
  }
}
