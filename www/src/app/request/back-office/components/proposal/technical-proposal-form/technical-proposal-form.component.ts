import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Request } from "../../../../common/models/request";
import { Observable, Subject } from "rxjs";
import { TechnicalProposalsService } from "../../../services/technical-proposals.service";
import { catchError, delayWhen, map, shareReplay, takeUntil, tap } from "rxjs/operators";
import { PositionWithManufacturer } from "../../../models/position-with-manufacturer";
import { TechnicalProposal } from "../../../../common/models/technical-proposal";
import { TechnicalProposalCreateRequest } from "../../../models/technical-proposal-create-request";
import { ContragentService } from "../../../../../contragent/services/contragent.service";
import { ContragentList } from "../../../../../contragent/models/contragent-list";
import { TechnicalProposalPositionStatus } from "../../../../common/enum/technical-proposal-position-status";
import { TechnicalProposalPosition } from "../../../../common/models/technical-proposal-position";
import { RequestPosition } from "../../../../common/models/request-position";
import { TechnicalProposalsStatus } from "../../../../common/enum/technical-proposals-status";
import { proposalManufacturingNameValidator } from "../proposal-form-manufacturing-name/proposal-form-manufacturing-name.validator";
import { ToastActions } from "../../../../../shared/actions/toast.actions";
import { Store } from "@ngxs/store";
import { AppFile } from "../../../../../shared/components/file/file";
import { UxgModalComponent } from "uxg";
import { saveAs } from 'file-saver/src/FileSaver';
import { searchContragents } from "../../../../../shared/helpers/search";
import { ProposalSource } from "../../../enum/proposal-source";

@Component({
  selector: 'app-request-technical-proposals-form',
  templateUrl: './technical-proposal-form.component.html',
  styleUrls: ['./technical-proposal-form.component.scss']
})
export class TechnicalProposalFormComponent implements OnInit, OnDestroy {

  @Input() request: Request;
  @Input() technicalProposal: TechnicalProposal;
  @Input() closable = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() create = new EventEmitter<TechnicalProposal>();
  @Output() update = new EventEmitter<TechnicalProposal>();
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  isLoading: boolean;
  form: FormGroup;
  procedureSource = ProposalSource;
  positionsWithManufacturer$: Observable<PositionWithManufacturer[]>;
  contragents$: Observable<ContragentList[]>;
  files: File[] = [];
  invalidDocControl = false;
  invalidUploadTemplate = false;
  showErrorMessage = false;
  publish = this.fb.control(true);
  readonly destroy$ = new Subject();
  readonly searchContragents = searchContragents;

  get formDocuments() {
    return this.form.get('documents') as FormArray;
  }

  get isManufacturingNamePristine(): boolean {
    return this.form.get("positions").value.filter(pos => pos.manufacturingName).length === 0;
  }

  get isEditing(): boolean {
    return !!this.technicalProposal;
  }

  constructor(
    private fb: FormBuilder,
    private rest: TechnicalProposalsService,
    private store: Store,
    private contragentService: ContragentService
  ) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [this.defaultTPValue('id')],
      contragent: [this.defaultTPValue('supplierContragent', null), Validators.required],
      documents: this.fb.array([]),
      positions: [this.defaultTPValue('positions', []), Validators.required]
    });

    if (this.isEditing && this.technicalProposal.status !== TechnicalProposalsStatus.NEW) {
      this.form.get('contragent').disable();
    }

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const docsCount = this.formDocuments.value.filter(file => file.valid).length + this.defaultTPValue('documents').length;

      if (this.form.get('documents').dirty && this.form.get('positions').dirty) {
        if (docsCount === 0 && this.form.get('positions').invalid) {
          this.invalidDocControl = true;
        }
        if (docsCount > 0 || this.form.get('positions').valid) {
          this.invalidDocControl = false;
          this.showErrorMessage = false;
        }
      }
      if (this.form.get('positions').dirty && this.form.get('positions').value.length && docsCount === 0
        && this.isManufacturingNamePristine && this.form.get('documents').dirty) {
        this.showErrorMessage = true;
      }
      this.form.get('positions').setValidators(
        docsCount > 0 && this.isManufacturingNamePristine ?
          [Validators.required] :
          [Validators.required, proposalManufacturingNameValidator]
      );

      this.form.get('positions').updateValueAndValidity({ emitEvent: false });
    });

    this.positionsWithManufacturer$ = this.rest.positions(this.request.id)
      .pipe(map(positions => positions.map(position => ({ position, manufacturingName: null }))));

    // Workaround sync with multiple elements per one formControl
    this.form.get('positions').valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(v => this.form.get('positions').setValue(v, { onlySelf: true, emitEvent: false }));

    this.contragents$ = this.contragentService.getContragentList().pipe(shareReplay(1));

  }

  filesSelected(files: AppFile[]): void {
    files.forEach(file => this.formDocuments.push(this.fb.control(file)));
  }

  /**
   * @TODO Remove ALL pipes mapTo(...) when backend fix
   */
  submit(): void {
    if (this.form.invalid || this.invalidUploadTemplate === true) {
      return;
    }

    this.isLoading = true;
    this.form.disable();

    let body: TechnicalProposalCreateRequest = {
      contragentId: this.form.get("contragent").value.id,
      positions: this.form.get("positions").value.map(positionsWithMan => positionsWithMan.position.id),
    };

    const docs = this.form.get("documents").value;

    let tp$: Observable<TechnicalProposal>;

    // Создаём / изменяем ТП
    if (!this.isEditing) {
      tp$ = this.rest.create(this.request.id, body);
    } else {
      body = { id: this.form.get("id").value, ...body };
      tp$ = this.rest.edit(this.request.id, body);
    }

    // Если есть доки - загружаем
    if (docs.length) {
      tp$ = tp$.pipe(delayWhen(tp => this.rest.uploadDocuments(
        this.request.id, tp.id, docs.filter(({ valid }) => valid).map(({ file }) => file))
      ));
    }

    // Проставляем заводские наименования.
    this.form.get("positions").value
      .filter(({ manufacturingName }) => manufacturingName)
      .filter(({ position, manufacturingName }) => {
        const tpPosition = this.findTpPosition(position);
        return !tpPosition || tpPosition.manufacturingName !== manufacturingName;
      })
      .map(({ position: { id }, manufacturingName }) => ({ position: { id }, manufacturingName }))
      .forEach(data => tp$ = tp$.pipe(
        delayWhen(tp => this.rest.setManufacturingName(this.request.id, tp.id, data))
      ));

    // Отправляем на согласование
    if (this.publish.value) {
      tp$ = tp$.pipe(delayWhen(tp => this.rest.sendForApproval(this.request.id, tp)));
    }

    tp$.pipe(takeUntil(this.destroy$)).subscribe(tp => {
      this.visibleChange.emit(false);
      this.isEditing ? this.update.emit(tp) : this.create.emit(tp);
    });
  }

  positionsWithManufacturerFilter(q: string, posWithMan: PositionWithManufacturer) {
    return posWithMan.position.name.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  private findTpPosition({ id }: RequestPosition): TechnicalProposalPosition {
    return this.technicalProposal?.positions.find(({ positionId }) => positionId === id);
  }

  private get supplierContragent() {
    const supplierContragent = this.defaultTPValue('supplierContragent', null);
    return supplierContragent ? supplierContragent : null;
  }

  trackByPositionId = ({ position }: PositionWithManufacturer) => position.id;
  defaultTPValue = (field: keyof TechnicalProposal, defaultValue: any = "") => this.technicalProposal?.[field] ?? defaultValue;

  positionSelectDisabled = ({ position }: PositionWithManufacturer) => {
    const tpPosition = this.findTpPosition(position);
    return tpPosition && tpPosition.status !== TechnicalProposalPositionStatus.NEW;
  }

  positionManufacturerNameDisabled = ({ position }: PositionWithManufacturer) => {
    const tpPosition = this.findTpPosition(position);
    return [TechnicalProposalPositionStatus.ACCEPTED, TechnicalProposalPositionStatus.DECLINED]
      .includes(tpPosition?.status);
  }

  onDownloadTemplate() {
    this.rest.downloadTemplate(this.request.id, this.form.get("contragent").value.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => saveAs(data, `RequestTechnicalProposalsTemplate.xlsx`));
  }

  onChangeFilesList(files: File[]): void {
    this.files = files;
    if (this.files.length !== 0) {
      this.invalidUploadTemplate = false;
    }
  }

  onSendTemplatePositions(): void {
    if (this.files.length === 0) {
      this.invalidUploadTemplate = true;
      return null;
    } else {
      this.uploadTemplateModal.close();
      this.rest.uploadTemplate(this.request.id, this.files).pipe(
        tap(() => this.store.dispatch(new ToastActions.Success("Шаблон импортирован"))),
        tap(({ requestTechnicalProposal }) => this.create.emit(requestTechnicalProposal)),
        catchError(({ error }) => this.store.dispatch(
          new ToastActions.Error(`Ошибка в шаблоне${error && error.detail && ': ' + error.detail || ''}`)
        )),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  getContragentName = (contragent: ContragentList) => contragent.shortName || contragent.fullName;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
