import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Contract } from "../../models/contract";
import { getCurrencySymbol } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import moment from "moment";
import { StateStatus } from "../../models/state-status";
import { AppFile } from "../../../../shared/components/file/file";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { createDetachedSignature } from "crypto-pro";
import { Uuid } from "../../../../cart/models/uuid";
import { UxgModalComponent } from "uxg";
import { Observable, Subject } from "rxjs";
import { ContractState } from "../../../customer/states/contract.state";
import { takeUntil } from "rxjs/operators";
import { ContractActions } from "../../../customer/actions/contract.actions";
import SignDocument = ContractActions.SignDocument;
import { FeatureService } from "../../../../core/services/feature.service";
import { RequestDocument } from "../../models/request-document";
import { DocumentsService } from "../../services/documents.service";

@Component({
  selector: 'app-contract-list-item',
  templateUrl: './contract-list-item.component.html',
  styleUrls: ['./contract-list-item.component.scss']
})
export class ContractListItemComponent implements OnInit, OnChanges {
  @ViewChild('signDocumentModal') signDocumentModal: UxgModalComponent;
  @ViewChild('certificatesListModal') certificatesListModal: UxgModalComponent;
  @Select(ContractState.status) status$: Observable<StateStatus>;

  @Input() contract: Contract;
  @Input() status: StateStatus;
  @Input() rollbackDuration: number;
  @Input() rollbackDate: string;
  @Output() send = new EventEmitter<{ comment?: string, files: File[] }>();
  @Output() rollback = new EventEmitter();
  @Output() approve = new EventEmitter();
  @Output() confirmWithoutSigning = new EventEmitter();
  @Output() reject = new EventEmitter<{ comment?: string, files: File[] }>();
  @Output() download = new EventEmitter();
  @Output() sign = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() openDocumentSignModal = new EventEmitter();
  @Output() signDocument = new EventEmitter();

  readonly certForm: FormGroup = this.fb.group({
    certificate: [null, Validators.required]
  });
  contractId: Uuid;
  signingStatus: boolean;
  folded: boolean;
  files: File[];
  historyFolded = true;
  historyFoldedLength = 3;
  destroy$ = new Subject();

  readonly getCurrencySymbol = getCurrencySymbol;
  readonly form = this.fb.group({ comment: "", files: null });

  get total(): number {
    return this.contract?.winners.reduce((total, { offerPosition: p }) => total += (p.priceWithoutVat * p.quantity), 0);
  }

  get canRollback(): boolean {
    return this.rollback.observers.length && ['ON_APPROVAL'].includes(this.contract.status) && moment().diff(moment(this.rollbackDate), 'seconds') < this.rollbackDuration;
  }

  get canSend(): boolean { return this.send.observers.length && ['NEW', 'REJECTED'].includes(this.contract.status); }
  get canReject(): boolean { return this.reject.observers.length && ['ON_APPROVAL'].includes(this.contract.status); }
  get canApprove(): boolean { return this.approve.observers.length && ['ON_APPROVAL'].includes(this.contract.status); }
  get canDelete(): boolean { return this.delete.observers.length && ['NEW'].includes(this.contract.status); }
  get approvedByCustomer(): boolean { return ['APPROVED'].includes(this.contract.status); }
  get confirmedByCustomerNoSign(): boolean { return ['CONFIRMED_BY_CUSTOMER_WO_SIGN'].includes(this.contract.status); }
  get signedByCustomer(): boolean { return ['SIGNED_BY_CUSTOMER'].includes(this.contract.status); }
  get signedBySupplier(): boolean { return ['SIGNED_BY_SUPPLIER'].includes(this.contract.status); }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    public user: UserInfoService,
    private actions: Actions,
    public featureService: FeatureService,
    private documentsService: DocumentsService
  ) {}

  ngOnInit() {
    this.actions.pipe(
      ofActionCompleted(SignDocument),
      takeUntil(this.destroy$)
    ).subscribe(({result}) => {
      const e = result.error as any;

      if (e) {
        this.store.dispatch(new ToastActions.Error(e && e.error.detail));
      } else {
        this.certificatesListModal.close();
        this.signingStatus = false;
        this.store.dispatch(new ToastActions.Success(`Договор успешно подписан`));
      }
    });
  }

  selectFiles(files: File[]) {
    this.files = files;
    this.form.get('files').setValue(this.files.map(f => new AppFile(f)).filter(({ valid }) => valid).map(({ file }) => file));
  }

  openCertificatesListModal() {
    this.signDocumentModal.close();
    this.certificatesListModal.open();
  }

  copyContractSignLink() {
    // todo перенести функциональность в отдельную директиву

    const linkToGo = window.location.origin + '/contracts-sign/' + this.contract.id;

    if (typeof(navigator.clipboard) === 'undefined') {
      const textArea = document.createElement("textarea");
      textArea.value = linkToGo;
      textArea.style.position = "fixed";  // avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const copied = document.execCommand('copy');
        if (copied) {
          this.store.dispatch(new ToastActions.Success("Ссылка успешно скопирована"));
        } else {
          this.store.dispatch(new ToastActions.Error('Не удалось скопировать ссылку'));
        }
      } catch (err) {
        this.store.dispatch(new ToastActions.Error('Не удалось скопировать ссылку: ' + err.error.detail));
      }

      document.body.removeChild(textArea);
    } else {
      navigator.clipboard.writeText(linkToGo).then(() => {
        this.store.dispatch(new ToastActions.Success("Ссылка успешно скопирована"));
      })
        .catch(err => {
          this.store.dispatch(new ToastActions.Error('Не удалось скопировать ссылку: ' + err.error.detail));
        });
    }
  }

  onSignDocument() {
    if (this.certForm.valid) {
      this.signingStatus = true;

      const requestId = this.contract.request.id;
      const selectedCertificate = this.certForm.get('certificate').value;
      const documentSignatures = [];

      const docToSign = this.contract.currentDocument;

      createDetachedSignature(selectedCertificate.data.thumbprint, docToSign.hash).then(response => {
        documentSignatures.push({
          id: docToSign.id,
          signature: response
        });

        const data = {
          certNumber: selectedCertificate.serialNumber,
          certOwnerName: selectedCertificate.ownerInfo['Владелец'],
          certIssuerName: selectedCertificate.issuerInfo['Компания'],
          certValidFrom: moment(selectedCertificate.data.validFrom).format('YYYY-MM-DD'),
          certValidTill: moment(selectedCertificate.data.validTo).format('YYYY-MM-DD'),
          documentSignatures
        };

        this.signDocument.emit({data, requestId});
      });
    }
  }

  ngOnChanges() {
    this.form.get('files').setValidators(this.canSend ? Validators.required : null);
  }

  onDownloadDocumentWithSign(document: RequestDocument) {
    if (!document.id) {
      return;
    }
    this.documentsService.downloadFileWithSign(document);
  }
}

