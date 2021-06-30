import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DadataBank, DadataConfig, DadataParty, DadataSuggestion, DadataType } from "@kolkov/ngx-dadata";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../core/config/gpnmarket-config.interface";
import * as moment from "moment";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { ContragentService } from "../../services/contragent.service";
import { ContragentRegistrationRequest } from "../../models/contragent-registration-request";
import { Observable, Subscription } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { ToastActions } from "../../../shared/actions/toast.actions";
import { ContragentShortInfo } from "../../models/contragent-short-info";
import { EmployeeService } from "../../../employee/services/employee.service";
import { EmployeeItem } from "../../../employee/models/employee-item";
import { Uuid } from "../../../cart/models/uuid";
import { ActivatedRoute, Router } from "@angular/router";
import { ContragentInfo } from "../../models/contragent-info";
import { UxgBreadcrumbsService } from "uxg";
import { Store } from "@ngxs/store";
import { User } from "../../../user/models/user";
import { ContragentRoleLabels } from "../../dictionaries/currency-labels";
import { ContragentRole } from "../../enum/contragent-role";
import { UsersGroup } from "../../../core/models/users-group";
import { UsersGroupService } from "../../../core/services/users-group.service";
import { UserInfoService } from "../../../user/service/user-info.service";

@Component({
  selector: 'app-contragent-registration',
  templateUrl: './contragent-registration.component.html',
  styleUrls: ['./contragent-registration.component.scss']
})
export class ContragentRegistrationComponent implements OnInit {
  @Output() contragentCreated = new EventEmitter<ContragentShortInfo>();
  form: FormGroup;
  autofillAlertShown = false;
  configParty: DadataConfig;
  configBank: DadataConfig;
  isLoading = false;
  seniorBackofficeUsers$: Observable<EmployeeItem[]>;
  groups$: Observable<UsersGroup[]>;
  subscription = new Subscription();
  contragentId: Uuid;
  contragent$: Observable<ContragentInfo>;

  contragentRating: number;

  readonly role = ContragentRole;
  readonly roleLabel = ContragentRoleLabels;

  get isEditing(): boolean {
    return !!this.contragentId;
  }

  get responsiblePlaceholder() {
    const responsible: User = this.form.get('contragentContact').get('responsible').value;
    return responsible && responsible.fullName || 'Выберите ответственного';
  }

  get groupPlaceholder() {
    const group: UsersGroup = this.form.get('contragent').get('usersGroup').value;
    return group && group.name || 'Выберите группу';
  }

  constructor(
    private fb: FormBuilder,
    @Inject(APP_CONFIG) appConfig: GpnmarketConfigInterface,
    private contragentService: ContragentService,
    private store: Store,
    private employeeService: EmployeeService,
    private usersGroupService: UsersGroupService,
    protected route: ActivatedRoute,
    private getContragentService: ContragentService,
    private bc: UxgBreadcrumbsService,
    protected router: Router,
    public user: UserInfoService,
  ) {
    this.configParty = {
      apiKey: appConfig.dadata.apiKey,
      type: DadataType.party
    };

    this.configBank = {
      apiKey: appConfig.dadata.apiKey,
      type: DadataType.bank
    };
  }

  ngOnInit() {
    this.contragentId = this.route.snapshot.paramMap.get('id');

    this.form = this.fb.group({
      contragent: this.fb.group({
        fullName: ['', [Validators.required, CustomValidators.simpleText]],
        shortName: ['', [Validators.required, CustomValidators.simpleText]],
        inn: ['', [Validators.required, CustomValidators.inn]],
        kpp: ['', [Validators.required, CustomValidators.kpp]],
        ogrn: ['', [Validators.required, CustomValidators.ogrn]],
        taxAuthorityRegistrationDate: ['', [Validators.required, CustomValidators.pastDate()]],
        role: [this.role.CUSTOMER],
        usersGroup: [null, Validators.required]
      }),
      contragentAddress: this.fb.group({
        country: ['', [Validators.required, CustomValidators.cyrillic]],
        region: ['', [CustomValidators.cyrillicNotRequired]],
        city: ['', [Validators.required, CustomValidators.cyrillic]],
        address: ['', [Validators.required, CustomValidators.simpleText]],
        postIndex: ['', [Validators.required, CustomValidators.index]]
      }),
      contragentBankRequisite: this.fb.group({
        account: ['', CustomValidators.bankAccount],
        correspondentAccount: ['', CustomValidators.corrAccount],
        bik: ['', CustomValidators.bik],
        name: [''],
        address: [''],
      }),
      contragentContact: this.fb.group({
        email: ['', CustomValidators.emailOptional],
        phone: ['', CustomValidators.phoneOptional],
        responsible: ['', Validators.required]
      }),
      contragentContractData: this.fb.group({
        contractSignerFio: [''],
        contractSignerPosition: [''],
        authorizingDocument: [''],
        agencyContract: [''],
        agencyContractCreatedDate: [null],
        letterOfAuthority: [''],
        letterOfAuthorityCreatedDate: [null],
      })
    });

    this.seniorBackofficeUsers$ = this.employeeService.getEmployeeList('SENIOR_BACKOFFICE');
    this.groups$ = this.usersGroupService.getBackofficeGroups();

    if (this.isEditing) {
      this.getContragentInfo();

      this.contragent$.subscribe(contragentInfo => {
        if (contragentInfo.ogrn) { this.form.get('contragent').get('ogrn').disable(); }
        if (contragentInfo.inn) { this.form.get('contragent').get('inn').disable(); }
      });
    } else {
      this.groups$.subscribe(groups => {
        this.form.get('contragent').get('usersGroup').setValue(groups[0]);
      });
    }
    this.form.get('contragent').get('role').disable();
  }

  onPartySuggestionSelected(event: DadataSuggestion & { data: DadataParty }): void {
    this.autofillAlertShown = true;
    const { inn, kpp, ogrn, state: { registration_date }, address: { value: address } } = event.data;
    const { full_with_opf: fullName, short_with_opf: shortName} = event.data.name;
    const { country, region, city, postal_code: postIndex, settlement: locality } = event.data.address.data;
    const taxAuthorityRegistrationDate = registration_date ? moment(new Date(registration_date)).format('DD.MM.YYYY') : '';
    this.touchForm();

    this.form.patchValue({
      contragent: { fullName, shortName, inn, kpp, ogrn, taxAuthorityRegistrationDate },
      contragentAddress: { country, region, city, postIndex, locality, address }
    });
    this.calculateContragentRating();
  }

  onBankSuggestionSelected(event: DadataSuggestion & { data: DadataBank }): void {
    this.autofillAlertShown = true;
    const { bic: bik, correspondent_account: correspondentAccount, name: { payment: name }, address: { value: address } } = event.data;
    this.touchForm();
    this.form.patchValue({ contragentBankRequisite: { bik, correspondentAccount, name, address } });
  }

  touchForm() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    (function markAsDirty(controls: { [key: string]: AbstractControl }) {
      Object.values(controls).forEach(c => c instanceof FormGroup ? markAsDirty(c.controls) : c.markAsDirty());
    })(this.form.controls);
  }

  submit() {
    if (this.form.valid) {
      this.isLoading = true;

      const body: ContragentRegistrationRequest = this.form.getRawValue();

      // Очищаем во вложенных формах поля, в которых переданы пустые строки
      for (const [k, nestedFields] of Object.entries(body)) {
        for (const [key, val] of Object.entries(nestedFields)) {
          if (val === '') { nestedFields[key] = null; }
        }
      }

      if (!this.isEditing) {
        this.subscription.add(
          this.contragentService.registration(body).pipe(
            finalize(() => this.isLoading = false)
          ).subscribe(
            contragent => {
              this.contragentCreated.emit(contragent);
              this.router.navigateByUrl(`contragents/list`);
              this.store.dispatch(new ToastActions.Success("Контрагент " + contragent.shortName + " успешно создан!"));
            },
            (err) => {
              this.store.dispatch(new ToastActions.Error('Ошибка регистрации! ' + err.error.detail));
            }
          )
        );
      } else {
        this.subscription.add(
          this.contragentService.editContragent(this.contragentId, body).pipe(
            finalize(() => this.isLoading = false)
          ).subscribe(
            contragent => {
              this.store.dispatch(new ToastActions.Success("Контрагент " + contragent.shortName + " успешно отредактирован!"));
              this.router.navigateByUrl(`contragents/list`);
            },
            (err) => {
              this.store.dispatch(new ToastActions.Error('Ошибка редактирования! ' + err.error.detail));
            }
          )
        );
      }
    }
  }

  getContragentInfo(): void {
    this.contragent$ = this.getContragentService.getContragentInfo(this.contragentId).pipe(
      tap(contragent => {
        this.bc.breadcrumbs = [
          {label: "Контрагенты", link: `/contragents/list`},
          {label: contragent.shortName, link: `/contragents/${this.contragentId}/info`},
          {label: "Редактировать", link: `/contragents/${this.contragentId}/edit`}
        ];
      }),
      tap(contragent => {
        this.form.get('contragent').patchValue(contragent);
        this.form.get('contragentAddress').patchValue(contragent.addresses[0]);
        this.form.get('contragentBankRequisite').patchValue(contragent.bankRequisites[0] || {});
        this.form.get('contragentContact').patchValue(contragent);
        this.form.get('contragentContact').get('responsible').patchValue(contragent.responsible);
        this.form.get('contragent').get('taxAuthorityRegistrationDate').patchValue(
          moment(new Date(contragent.taxAuthorityRegistrationDate)).format('DD.MM.YYYY'));
        this.form.get('contragentContractData').patchValue(contragent.contractData || {});

        if (contragent.contractData?.agencyContractCreatedDate) {
          this.form.get('contragentContractData').get('agencyContractCreatedDate').patchValue(
            moment(new Date(contragent.contractData.agencyContractCreatedDate)).format('DD.MM.YYYY'));
        }
        if (contragent.contractData?.letterOfAuthorityCreatedDate) {
          this.form.get('contragentContractData').get('letterOfAuthorityCreatedDate').patchValue(
            moment(new Date(contragent.contractData.letterOfAuthorityCreatedDate)).format('DD.MM.YYYY'));
        }
      })
    );
  }

  isFutureDate(date: Date): boolean {
    return moment(new Date(date)).isAfter();
  }

  // Фейковый подсчёт рейтинга надёжности контрагента.
  // При ИНН кратном 2 — три здвезды, при кратном 3 — четыре здвезды, в остальных случаях — пять здвезд
  calculateContragentRating(): void {
    const inn = this.form.get('contragent').get('inn').value;

    if (inn % 2 === 0) {
      this.contragentRating = 3;
    } else if (inn % 3 === 0) {
      this.contragentRating = 4;
    } else {
      this.contragentRating = 5;
    }
  }

  isRatingStarActive(value): boolean {
    return value <= this.contragentRating;
  }
}
