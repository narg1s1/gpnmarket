import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntil, tap } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { ContractSignActions } from "../../actions/contract-sign.actions";
import Fetch = ContractSignActions.Fetch;
import { ContractSignState } from "../../states/contract-sign.state";
import { Contract } from "../../../request/common/models/contract";
import { RequestDocument } from "../../../request/common/models/request-document";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UxgBreadcrumbsService, UxgModalComponent } from "uxg";
import { createDetachedSignature } from "crypto-pro";
import { Uuid } from "../../../cart/models/uuid";
import { ToastActions } from "../../../shared/actions/toast.actions";
import { StateStatus } from "../../../request/common/models/state-status";
import SignDocument = ContractSignActions.SignDocument;
import moment from "moment";

@Component({
  selector: 'app-contract-sign',
  templateUrl: './contract-sign.component.html',
  styleUrls: ['./contract-sign.component.scss']
})

export class ContractSignComponent implements OnInit, OnDestroy {
  @ViewChild('certificatesListModal') certificatesListModal: UxgModalComponent;
  @Select(ContractSignState.contractSignInfo) contractSignInfo$: Observable<Contract>;
  @Select(ContractSignState.status) status$: Observable<StateStatus>;

  destroy$ = new Subject();
  signerName: string;

  contract: Contract;
  contractId: Uuid;
  documentsToSign: RequestDocument[];
  signingStatus: boolean;

  readonly certForm: FormGroup = this.fb.group({
    certificate: [null, Validators.required]
  });

  constructor(
    public store: Store,
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private actions: Actions,
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({ id }) => {
        this.contractId = id;
        this.store.dispatch(new Fetch(id));
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.contractSignInfo$.subscribe(data => {
      const customerInfo = data?.currentDocument.documentSignatures.find(signature => signature.contragentId === data.customer.id);

      this.contract = data;
      this.signerName = customerInfo?.ownerName;
      this.documentsToSign = data?.documents;
    });

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

  openSignDocumentModal() {
    this.certificatesListModal?.open();
  }

  onSignDocument() {
    if (this.certForm.valid) {
      this.signingStatus = true;

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

        this.store.dispatch(new SignDocument(this.contractId, data));
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

