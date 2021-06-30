import { Component, forwardRef, OnDestroy, OnInit, QueryList } from '@angular/core';
import { Certificate, createDetachedSignature, getUserCertificates, getSystemInfo, isValidSystemSetup } from "crypto-pro";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { fromPromise } from "rxjs/internal-compatibility";
import { CertificateListItem } from "../../models/certificate-list-item.model";
import { combineLatest, Observable, of, race, Subject, Subscription } from "rxjs";
import { delay, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-digital-signature-list',
  templateUrl: './digital-signature-list.component.html',
  styleUrls: ['./digital-signature-list.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DigitalSignatureListComponent),
    multi: true
  }]
})
export class DigitalSignatureListComponent implements OnInit, OnDestroy {

  public value: string;
  certificates: CertificateListItem[];
  isValidSystemSetup$: Observable<any>;
  userCertificates$: Observable<any>;
  thumbprint: string;
  onTouched: (value) => void;
  onChange: (value) => void;

  isValidSystemSetup: boolean;
  signatureError: boolean;

  subscription = new Subscription();
  destroy$ = new Subject();

  constructor() { }

  ngOnInit(): void {
    this.isValidSystemSetup = null;

    this.isValidSystemSetup$ = fromPromise(isValidSystemSetup());
    this.userCertificates$ = fromPromise(getUserCertificates());

    const timeout = of(new Error("timed out")).pipe(delay(7000));
    const isValidCryptoProSetup = race(this.isValidSystemSetup$, timeout).pipe(takeUntil(this.destroy$));

    isValidCryptoProSetup.subscribe(response => {
      if (response === true) {
        this.isValidSystemSetup = true;
        this.getCertificatesList();
      } else {
        this.isValidSystemSetup = false;
      }
    });
  }

  getCertificatesList(): void {
    this.certificates = [];

    this.userCertificates$.subscribe((certificatesList: Certificate[]) => {
      certificatesList.forEach(certificate => {
        this.normalizeCertificateInfo(certificate);
      });
    });
  }

  normalizeCertificateInfo(certificate: Certificate): void {
    const certificateInfo = <CertificateListItem>{};

    const serialNumber$ = fromPromise(certificate.getCadesProp("SerialNumber"));
    const ownerInfo$ = fromPromise(certificate.getOwnerInfo());
    const issuerInfo$ = fromPromise(certificate.getIssuerInfo());
    const isValid$ = fromPromise(certificate.isValid());

    combineLatest([serialNumber$, ownerInfo$, issuerInfo$, isValid$]).subscribe(([serialNumber, ownerInfoFields, issuerInfoFields, isValid]) => {
      certificateInfo['data'] = certificate;
      certificateInfo['serialNumber'] = serialNumber;
      certificateInfo['ownerInfo'] = {};
      certificateInfo['issuerInfo'] = {};
      certificateInfo['isValid'] = isValid;

      ownerInfoFields.forEach(item => certificateInfo['ownerInfo'][item.title] = item.description);
      issuerInfoFields.forEach(item => certificateInfo['issuerInfo'][item.title] = item.description);

      this.certificates.push(certificateInfo);
    });
  }

  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  writeValue = (value: any | null) => this.value = value;

  select(certificate) {
    this.writeValue(certificate);
    this.onChange(this.value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
