import { IPositionsFilters } from './../../../../../positions/positions-filter';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UxgWizzard, UxgWizzardBuilder, UxgWizzardStep } from "uxg";
import { CustomValidators } from "../../../../../shared/forms/custom.validators";
import { Request } from "../../../../common/models/request";
import { RequestPosition } from "../../../../common/models/request-position";
import { ProcedureService } from "../../../services/procedure.service";
import { Procedure } from "../../../models/procedure";
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  flatMap,
  startWith,
  switchMap,
  takeUntil,
  tap
} from "rxjs/operators";
import { Select, Store } from "@ngxs/store";
import { ContragentList } from "../../../../../contragent/models/contragent-list";
import { TextMaskConfig } from "angular2-text-mask/src/angular2TextMask";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";
import { ToastActions } from "../../../../../shared/actions/toast.actions";
import * as moment from "moment";
import { ContragentService } from "../../../../../contragent/services/contragent.service";
import { Observable, Subject, throwError } from "rxjs";
import { ProcedureAction } from "../../../models/procedure-action";
import { ProposalSource } from "../../../enum/proposal-source";
import { PositionStatus } from "../../../../common/enum/position-status";
import { PositionStatusesLabels } from "../../../../common/dictionaries/position-statuses-labels";
import { Okpd2Item } from "../../../../../core/models/okpd2-item";
import { Uuid } from "../../../../../cart/models/uuid";
import { CommercialProposalsService } from "../../../services/commercial-proposals.service";
import { searchContragent } from "../../../../../shared/helpers/search";
import { Okpd2Service } from "../../../../../shared/services/okpd2.service";
import { TechnicalCommercialProposals } from "../../../actions/technical-commercial-proposal.actions";
import FetchAvailableRequestPositionsDocuments = TechnicalCommercialProposals.FetchAvailableRequestPositionsDocuments;
import { RequestDocument } from "../../../../common/models/request-document";
import { TechnicalCommercialProposalState } from "../../../states/technical-commercial-proposal.state";

@Component({
  selector: 'app-request-procedure-form',
  templateUrl: './procedure-form.component.html',
  styleUrls: ['./procedure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Select(TechnicalCommercialProposalState.procedureCreationAvailableDocuments) procedureCreationAvailableDocuments$: Observable<RequestDocument[]>;

  @Input() procedure: Partial<Procedure>;
  @Input() request: Request;
  @Input() positions: RequestPosition[];
  @Input() contragents: ContragentList[] | ContragentShortInfo[] = [];
  @Input() action: ProcedureAction["action"] = "create";
  @Input() procedureSource: ProposalSource = ProposalSource.COMMERCIAL_PROPOSAL;
  @Input() groupId: Uuid;
  @Input() isWithoutStartPrice: boolean;
  @Input() useAllPositions?: boolean;
  // Используем виртуал скролл для просмотра всех позиций
  @Input() isVirtualScrollUsed?: boolean;
  @Input() activeFilters?: IPositionsFilters;

  @Output() complete = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() positionsSelected = new EventEmitter<Uuid[]>();
  @Output() filterPositions = new EventEmitter();

  form: FormGroup;
  allContragents$: Observable<ContragentList[]>;
  okpd2List$ = new Subject<Okpd2Item[]>();
  wizzard: UxgWizzard;
  @Input() isLoading: boolean;
  publicAccessReadonly: boolean;
  positionsFirstLoadDone: boolean;
  procedureAvailableDocuments: RequestDocument[];

  readonly destroy$ = new Subject();
  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly mask: TextMaskConfig = {
    mask: value => [/[0-2]/, value[0] === "2" ? /[0-3]/ : /[0-9]/, ' ', ':', ' ', /[0-5]/, /\d/],
    guide: false,
    keepCharPositions: true
  };
  readonly searchContragent = searchContragent;
  readonly getOkpd2Name = (okpd2: Okpd2Item) => okpd2.code ? okpd2.code + ' ' + okpd2.name : '';
  readonly searchOkpd2 = (query, items: Okpd2Item[]) => items;

  get documents() {
    const positions = (this.positions || this.form.get("positions").value) as RequestPosition[];
    return positions
      .reduce((documents: [], position) => [...documents, ...position.documents], [])
      // Отфильтровываем дубликаты документов
      .filter((document, index, arr) => index === arr.findIndex(doc => doc.hash === document.hash));
  }

  constructor(
    private fb: FormBuilder,
    private wb: UxgWizzardBuilder,
    private procedureService: ProcedureService,
    private commercialProposalsService: CommercialProposalsService,
    private contragentService: ContragentService,
    private okpd2Service: Okpd2Service,
    private store: Store,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.wizzard = this.wb.create({
      positions: { label: this.isVirtualScrollUsed ? "Просмотр позиций" : "Выбор позиций", disabled: this.action !== "create", validator: () => !this.form.get('positions').invalid },
      general: ["Общие сведения", () => this.form.get('general').valid && (!!this.contragents || this.form.get('privateAccessContragents').valid)],
      contragents: { label: "Участники", hidden: true, validator: () => !this.form.get('privateAccessContragents').invalid },
      properties: { label: "Параметры", disabled: this.action === 'prolong' },
      documents: ["Документы", () => this.form.valid],
    });

    this.form = this.fb.group({
      positions: [this.defaultProcedureValue("positions", []), [Validators.required]],
      general: this.fb.group({
        requestProcedureId: [this.defaultProcedureValue("id")],
        procedureTitle: [this.defaultProcedureValue("procedureTitle"), [Validators.required, Validators.minLength(3)]],
        dateEndRegistration: [null, [CustomValidators.currentOrFutureDate(), CustomValidators.compareProcedureDates()]],
        dateSummingUp: [
          moment(this.procedure?.dateSummingUp?.date).format("DD.MM.YYYY HH:mm"),
          [Validators.required, CustomValidators.currentOrFutureDate(), CustomValidators.compareProcedureDates()]
        ],
        withoutTotalPrice: [this.defaultProcedureValue("withoutTotalPrice", false)],
        withoutTotalPriceReason: [this.defaultProcedureValue("withoutTotalPriceReason", 'НМЦ не рассчитывалась'), [Validators.required]],
        dishonestSuppliersForbidden: this.defaultProcedureValue("dishonestSuppliersForbidden", false),
        publicAccess: [true, Validators.required],
        okpd2: ["", Validators.required],
        prolongateEndRegistration: this.defaultProcedureValue("prolongateEndRegistration", 0), // Продление времени приема заявок на участие (минут)
        useAllPositions: this.useAllPositions || false
      }),
      properties: null,
      privateAccessContragents: [ this.defaultProcedureValue("privateAccessContragents", []) ],
      documents: this.fb.group({
        procedureDocuments: [ this.defaultProcedureValue("procedureDocuments", []) ], // Документы, относящиеся к позицям
        procedureUploadDocuments: [ this.defaultProcedureValue("procedureUploadDocuments", [])] // Загруженные документы
      }),
    });

    if (this.useAllPositions) {
      this.form?.get('general.useAllPositions').setValue(true);
      this.form?.get('general.useAllPositions').disable();
      this.form?.get('positions').setValidators(null);
      this.form?.get('positions').disable();
      this.form?.get('positions').updateValueAndValidity();
    }

    this.form.get('general.useAllPositions').valueChanges.subscribe(useAllPositions => {
      const c = this.form.get('positions');
      if (useAllPositions) {
        c.setValidators(null);
        c.disable();
      } else {
        c.setValidators([Validators.minLength(1), Validators.required]);
        c.enable();
      }
      c.updateValueAndValidity({onlySelf: true, emitEvent: false});

      if (useAllPositions) {
        if (this.request) {
          this.store.dispatch(
            new FetchAvailableRequestPositionsDocuments(
              this.request.id,
              this.groupId || null,
              this.groupId ? { isOnlyNotInProcedure: !!this.groupId } : null
            )
          ).pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.procedureCreationAvailableDocuments$)
          ).subscribe(documents => this.procedureAvailableDocuments = documents);
        } else {
          this.procedureAvailableDocuments = this.documents;
        }
      }
    });

    this.form.get('properties').patchValue(this.procedure ?? null);

    if (this.action === 'prolong') {
      this.wizzard.get("positions").disable();
      this.wizzard.get("properties").disable();
      this.form.get("positions").disable();
      this.form.get("properties").disable();
    }

    if (this.action === 'bargain') {
      this.wizzard.get("positions").disable();
      this.wizzard.get("documents").disable();
      this.wizzard.get("contragents").disable();
      this.form.get("positions").disable();
      this.form.get("general.procedureTitle").disable();
      this.form.get("general.dishonestSuppliersForbidden").disable();
      this.form.get("general.okpd2").disable();
      this.form.get("general.publicAccess").disable();
      this.form.get("general.withoutTotalPrice").disable();
      this.form.get("general.withoutTotalPriceReason").disable();
      this.form.get('general.dateSummingUp').disable();
      this.procedure.privateAccessContragents?.length ?
        this.form.get("general.publicAccess").setValue(false) :
        this.form.get("general.publicAccess").setValue(true);
    }

    if (!this.form.get("general.publicAccess").value) {
      this.form.get("general.okpd2").disable();
    }

    this.form.get("positions").valueChanges.pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(selectedPositions => {
        if (this.procedureSource === ProposalSource.COMMERCIAL_PROPOSAL && selectedPositions.length > 0) {
          this.positionsSelected.emit(selectedPositions.map(position => position.id));
        }
      });

    this.form.get("general.publicAccess").valueChanges.pipe(
      startWith(<{}>this.form.get('general.publicAccess').value),
      tap((publicAccess) => this.form.get("privateAccessContragents").setValidators(
        publicAccess ? null : [Validators.required, Validators.minLength(2)]
      )),
      tap((publicAccess ) => this.wizzard.get("contragents").toggle(!publicAccess)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form.get("general.publicAccess").valueChanges.subscribe(
      selected => {
        selected ? this.form.get("general.okpd2").enable() : this.form.get("general.okpd2").disable();
      }
    );

    this.form.get("general.okpd2").valueChanges.pipe(
      debounceTime(500),
      filter(value => typeof value === 'string'),
      flatMap(value => this.okpd2Service.getOkpd2(value)),
      tap(v => this.okpd2List$.next(v)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.allContragents$ = this.contragentService.getContragentList();
  }

  ngAfterViewInit(): void {
    this.form?.get('positions').updateValueAndValidity();
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contragents) {
      this.publicAccessReadonly = !((this.contragents?.length ?? 0) < 2 && (this.procedure?.privateAccessContragents?.length ?? 0) < 2);
      if (this.publicAccessReadonly) {
        this.form?.get("general.publicAccess").setValue(false);
      }
    }

    if (changes.positions && !changes.positions.previousValue && changes.positions.currentValue && !this.positionsFirstLoadDone) {
      if (this.positions?.length) {

        // По-умолчанию при открытии формы блокируем список позиций, т.к. выбраны все позиции
        this.form?.get('positions').setValidators(null);
        this.form?.get('positions').disable();

        // Включаем чекбокс "Выбрать все", когда не используется виртуал-скролл
        if (!this.isVirtualScrollUsed) {
          this.form?.get('general.useAllPositions').enable();
          this.form?.get('general.useAllPositions').setValue(true);
        }
      } else {
        this.form?.get('general.useAllPositions').setValue(false);
        this.form?.get('general.useAllPositions').disable();
      }

      this.positionsFirstLoadDone = true;
    }

    if (this.isWithoutStartPrice) {
      this.form?.get("general.withoutTotalPrice").setValue(true);
    } else {
      this.form?.get("general.withoutTotalPrice").setValue(false);
    }
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const body: Procedure = {
      ...(this.form.get("general") as FormGroup).getRawValue(),
      ...this.form.get("properties").value,
      okpd2: this.form.get("general.publicAccess").value ? this.form.get("general.okpd2").value.code : "01.11",
      positions: (this.isVirtualScrollUsed ? this.positions : this.form.get("positions").value).map(({id}) => id),
      privateAccessContragents: this.form.get("general.publicAccess").value ? [] : this.form.get("privateAccessContragents").value.map(({id}) => id),
      procedureDocuments: this.form.get("documents.procedureDocuments").value.map(({id}) => id),
      procedureUploadDocuments: this.form.get("documents.procedureUploadDocuments").value,
      dateEndRegistration: moment(this.form.get('general.dateEndRegistration').value, "DD.MM.YYYY HH:mm").toISOString(),
      dateSummingUp: moment(this.form.get('general.dateSummingUp').value, "DD.MM.YYYY HH:mm").toISOString(),
      source: this.procedureSource,
    };

    delete body['timeEndRegistration'];
    delete body['timeSummingUp'];

    if (this.procedureSource === ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL && this.groupId) {
      body['requestTechnicalCommercialProposalGroupId'] = this.groupId;
    }

    if (this.procedureSource === ProposalSource.COMMERCIAL_PROPOSAL && this.groupId) {
      body['requestCommercialProposalGroupId'] = this.groupId;
    }

    this.isLoading = true;
    this.form.disable();

    let request$;
    switch (this.action) {
      case "create":
        request$ = (this.procedureSource === ProposalSource.REQUEST) ?
          this.procedureService.createFromRequest(this.request?.id, body) :
          (this.procedureSource === ProposalSource.POSITION) ?
            this.procedureService.createFromPosition(body, this.activeFilters, this.useAllPositions) :
            this.procedureService.create(this.request?.id, body);
        break;
      case "bargain": request$ = this.procedureService.bargain(this.procedure.id, body);
    }

    request$.pipe(
      tap((response) => this.complete.emit(response)),
      tap(({procedureId}) => this.store.dispatch(
        new ToastActions.Success(procedureId ? `Процедура ${ procedureId } успешно отправлена` : `Процедура отправлена в обработку и скоро будет доступна`)
      )),
      catchError(err => {
        this.store.dispatch(new ToastActions.Error(err?.error?.detail || "Ошибка при создании процедуры"));
        return throwError(err);
      }),
      finalize(() => {
        this.form.enable();
        this.isLoading = false;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  getStepIcon<S>(stepInfo: UxgWizzardStep<S>) {
    switch (true) {
      case stepInfo.disabled: return 'app-lock';
      case stepInfo.completed: return 'app-check';
    }
  }

  isStatusInvalid(status: PositionStatus) {
    return [
      PositionStatus.WINNER_SELECTED,
      PositionStatus.TCP_WINNER_SELECTED,
      PositionStatus.RESULTS_AGREEMENT,
      PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT
    ].includes(status);
  }


  trackById = (item: RequestPosition | ContragentList) => item.id;
  defaultProcedureValue = (field: string, defaultValue: any = "") => this.procedure?.[field] ?? defaultValue;
  disabledPositions = ({ hasProcedure, status }: RequestPosition): boolean => hasProcedure || this.isStatusInvalid(status);

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
