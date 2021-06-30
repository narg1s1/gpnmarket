import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { ActivatedRoute, Router, UrlTree } from "@angular/router";
import { getCurrencySymbol } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription} from "rxjs";
import { PositionStatusesLabels } from "../../dictionaries/position-statuses-labels";
import { Request } from "../../models/request";
import { RequestGroup } from "../../models/request-group";
import { RequestPosition } from "../../models/request-position";
import { RequestPositionList } from "../../models/request-position-list";
import { RequestService } from "../../../customer/services/request.service";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { FeatureService } from "../../../../core/services/feature.service";
import { PositionStatus } from "../../enum/position-status";
import { PermissionType } from "../../../../auth/enum/permission-type";
import { RequestPositionStatusService } from "../../services/request-position-status.service";
import { StateStatus } from "../../models/state-status";
import { debounceTime, map, switchMap, tap } from "rxjs/operators";
import { UxgFilterCheckboxList, UxgModalComponent, UxgPopoverContentDirection } from "uxg";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { User } from "../../../../user/models/user";
import { RequestsListFilter } from "../../models/requests-list/requests-list-filter";
import { RequestActions as ApproverRequestActions } from "../../../approver/actions/request.actions";
import moment from "moment";
import { AvailableFilters } from "../../models/requests-list/available-filters";
import { searchUsers } from "../../../../shared/helpers/search";
import { PositionStatusesFrequent } from "../../dictionaries/position-statuses-frequent";
import { Uuid } from "../../../../cart/models/uuid";
import { RequestAvailableFilters } from "../../models/request-available-filters";
import { RequestFilters } from "../../models/request-filters";
import { Unsubscription } from "src/app/core/decorators/unsubscription";
import { ProcedureAction } from "../../../back-office/models/procedure-action";
import { Procedure } from "../../../back-office/models/procedure";
import { ProposalSource } from "../../../back-office/enum/proposal-source";
import ApproverAttachDocuments = ApproverRequestActions.AttachDocuments;
import { Store } from "@ngxs/store";

@Unsubscription()
@Component({
  selector: "app-request",
  templateUrl: "./request.component.html",
  styleUrls: ["./request.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editRequestNameModal') editRequestNameModal: UxgModalComponent;
  @ViewChild('addDocumentsModal') addDocumentsModal: UxgModalComponent;
  @ViewChild('rejectPositionModal') rejectPositionModal: UxgModalComponent;

  @Input() request: Request;
  @Input() positions: RequestPositionList[];
  @Input() procedureCreationPositions: RequestPositionList[];
  @Input() groups: RequestGroup[];
  @Input() onDrafted: (position: RequestPosition) => Observable<RequestPosition>;
  @Input() status: StateStatus;
  @Input() positionsStatus: StateStatus;
  @Input() total: number;
  @Input() totalCountWithoutNotRelevantAndCanceled: number;
  @Input() isWithoutStartPrice: boolean;
  @Input() availableFilters$: Observable<RequestAvailableFilters>;
  @Input() filterForm: FormGroup;
  @Input() pageSize: number;
  @Output() addGroup = new EventEmitter();
  @Output() addPosition = new EventEmitter();
  @Output() changeStatus = new EventEmitter();
  @Output() addResponsiblePositions = new EventEmitter<{ positions: RequestPosition[], user: User, useAllPositions: boolean, filters: RequestFilters }>();
  @Output() addResponsibleRequest = new EventEmitter<User>();
  @Output() createTemplate = new EventEmitter();
  @Output() publish = new EventEmitter();
  @Output() reject = new EventEmitter();
  @Output() approve = new EventEmitter();
  @Output() publishPositions = new EventEmitter();
  @Output() approvePositions = new EventEmitter();
  @Output() rejectPositions = new EventEmitter();
  @Output() attachDocuments = new EventEmitter();
  @Output() saveRequestName = new EventEmitter();
  @Output() uploadFromTemplate = new EventEmitter();
  @Output() filter = new EventEmitter<{ filters?: RequestFilters, page?: number }>();
  @Output() filterProcedureCreationPositions = new EventEmitter<string>();
  @Output() refreshAll = new EventEmitter();

  readonly popoverDir = UxgPopoverContentDirection;
  readonly permissionType = PermissionType;
  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly PositionStatus = PositionStatus;
  readonly getCurrencySymbol = getCurrencySymbol;
  readonly pages$ = this.route.queryParams.pipe(map(params => +params["page"]));

  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  procedureTypeList = ["byPosition", "twoStage", "byPrice"];
  procedureType: "byPosition" | "twoStage" | "byPrice";
  flatPositions: RequestPosition[] = [];
  form: FormGroup;
  editedPosition: RequestPosition;
  checkedPositions: RequestPosition[] = [];
  useAllPositions: boolean;
  selectedAll$ = new BehaviorSubject<boolean>(false);
  isDraft: boolean;
  isOnApproval: boolean;
  canChangeStatuses: boolean;
  canPublish: boolean;
  invalidUploadDocument: boolean;
  positionStatuses$: Observable<{ value: PositionStatus, item: AvailableFilters["positionStatuses"][number] }[]>;
  responsibleUsers$: Observable<UxgFilterCheckboxList<Uuid>>;

  readonly responsibleUsersSearch$ = new BehaviorSubject<string>("");
  readonly procedureSource = ProposalSource.REQUEST;

  requestNameForm = new FormGroup({
    requestName: new FormControl('', [CustomValidators.requiredNotEmpty, Validators.maxLength(250)]),
  });

  positionRejectForm = new FormGroup({
    comment: new FormControl(''),
    documents: new FormControl([])
  });

  private subs: Subscription[] = [];

  get formPositions(): FormArray {
    return this.form.get("positions") as FormArray;
  }

  get isAllPositionsSelected(): boolean {
    return this.formPositionsFlat.every((formGroup: FormGroup) => {
      return formGroup.get('checked').value;
    });
  }

  get isUncheckedPositionsExist(): boolean {
    return (this.checkedPositionsOfCurrentPage.length > 0) && this.formPositionsFlat.some((formGroup: FormGroup) => {
      return !formGroup.get('checked').value;
    });
  }

  public isUncheckedPositionsInGroupExist(formGroup: FormGroup | RequestGroup): boolean {
    if (formGroup instanceof RequestGroup) {
      return;
    }

    const positions = (formGroup.get('positions') as FormArray).controls;

    const isSomeChecked = positions?.some(control =>  control?.get('checked').value);
    const isSomeUnchecked = positions?.some(control =>  !control?.get('checked').value);

    return isSomeChecked && isSomeUnchecked;
  }

  public isAllPositionsInGroupSelected(formGroup: FormGroup | RequestGroup): boolean {
    if (formGroup instanceof RequestGroup) {
      return;
    }

    const childPositions = (formGroup.get('positions') as FormArray).controls;

    return childPositions?.every((childFormGroup: FormGroup & RequestPosition) => {
      return childFormGroup?.get('checked').value;
    });
  }

  private get formPositionsFlat(): FormGroup[] {
    return this.formPositions.controls
      .reduce((arr, formGroup) => {
        if (formGroup && formGroup.get("positions") && formGroup.get("positions").value.length > 0) {
          return [...arr, ...(formGroup.get("positions") as FormArray).controls];
        }
        return [...arr, formGroup];
      }, [])
      .filter(formGroup => this.asPosition(formGroup.get("position").value));
  }

  get procedureCreationPositionsFlat() {
    return this.requestService.getRequestPositionsFlat(this.procedureCreationPositions);
  }

  get draftPositions(): RequestPositionList[] {
    return this.positions.filter(function getRecursive(position) {
      const isDraft: boolean = position instanceof RequestPosition &&  position.status === PositionStatus.DRAFT;
      const isGroupHasDrafts: boolean = position instanceof RequestGroup && position.positions.filter(getRecursive).length > 0;
      return isDraft || isGroupHasDrafts;
    });
  }

  get disabledPositions(): RequestPositionList[] {
    const that = this;

    return this.flatPositions.filter(function getRecursive(position) {
      return position instanceof RequestPosition && that.isPositionDisabled(position);
    });
  }

  get checkedPositionsOfCurrentPage() {
    return this.formPositionsFlat.filter(formGroup => formGroup.value.checked);
  }

  get noPositionsList() {
    return this.positionsStatus === 'received' && this.positions.length === 0 &&
      (!this.user.isBackOffice() || this.user.isBackOffice() && this.filterForm?.pristine);
  }

  private get hasOnApprovalPositions(): RequestPositionList[] {
    return this.flatPositions.filter(position => position.status === PositionStatus.ON_CUSTOMER_APPROVAL);
  }

  get selectedPageWithDisabledPositions(): boolean {
    return this.form.get('checked').value && this.formPositionsFlat.length > 0 && this.formPositionsFlat.length === this.disabledPositions.length;
  }

  canEditRequestName(): boolean {
    return (this.featureService.authorize('editRequestNameCustomer') && ['DRAFT', 'ON_CUSTOMER_APPROVAL'].indexOf(this.request.status) !== -1) ||
           (this.featureService.authorize('editRequestNameBackoffice') && ['NEW', 'IN_PROGRESS'].indexOf(this.request.status) !== -1);
  }

  everyPositionHasStatus(positions: RequestPosition[], statuses: PositionStatus[]): boolean {
    return positions.every(position => statuses.includes(position.status));
  }

  someOfPositionsHasStatus(positions: RequestPosition[], statuses: PositionStatus[]): boolean {
    return positions.some(position => statuses.includes(position.status));
  }

  showCheckbox(positions: RequestPosition[]) {
    return this.user.isCustomer() ||
      (this.user.isCustomerApprover() && positions.some(position => position.status === PositionStatus.PROOF_OF_NEED));
  }

  someOfPositionsAreInProcedure(): boolean {
    return this.checkedPositions.some(position => position.isInProcedure === true);
  }

  everyPositionIsNotDraftEntity(): boolean {
    return this.checkedPositions.every(position => position.isDraftEntity === false);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private statusService: RequestPositionStatusService,
    public cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private store: Store,
    public user: UserInfoService,
    public featureService: FeatureService
  ) {}

  ngOnInit() {
    this.positionStatuses$ = this.availableFilters$?.pipe(map(f => f?.positionStatuses.map(
      status => ({ value: status.status, item: status, hideFolded: PositionStatusesFrequent.indexOf(status.status) < 0 })
    )));

    this.responsibleUsers$ = this.availableFilters$ && this.responsibleUsersSearch$.pipe(
      switchMap(q => this.availableFilters$.pipe(
        map(f => searchUsers(q, f?.responsibleUsers ?? []).map(u => ({ label: u.shortName, value: u.id })))
      )),
      tap(() => this.cd.detectChanges())
    );

    this.form = this.fetchForm(this.positions);

    if (this.user.isCustomerApprover()) {
      this.positionRejectForm.get('comment').setValidators([CustomValidators.requiredNotEmpty]);
      this.positionRejectForm.get('comment').updateValueAndValidity();
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.positions && this.positions?.length) {
      this.form = this.fetchForm(this.positions);
      this.flatPositions = this.requestService.getRequestPositionsFlat(this.positions);
      this.isDraft = this.draftPositions.length > 0;
      this.isOnApproval = this.featureService.authorize("approveRequest") && this.hasOnApprovalPositions.length > 0;

      this.formPositionsFlat.forEach(formGroup => {
        const formPositionId = formGroup.get('position').value.id;
        const positionExists = this.checkedPositions.find(checkedPosition => checkedPosition.id === formPositionId);

        formGroup.get('checked').setValue(positionExists, { onlySelf: false, emitEvent: false });

        this.subs.push(
          formGroup.valueChanges.pipe(debounceTime(10)).subscribe(checkedItem => {
            this.useAllPositions = null;
            const positionIndex = this.checkedPositions.findIndex(checkedPosition => checkedPosition.id === checkedItem.position.id);

            if (positionIndex !== -1) {
              if (!checkedItem.checked) { this.checkedPositions.splice(positionIndex, 1); }
            } else {
              if (checkedItem.checked) { this.checkedPositions.push(checkedItem.position); }
            }
          })
        );

      });

      this.subs.push(
        this.formPositions.valueChanges.pipe(debounceTime(10)).subscribe(value => {
          this.canChangeStatuses = this.checkedPositions.length && this.checkedPositions.every(
            position => position.status === this.checkedPositions[0].status
          );

          this.canPublish = this.checkedPositions.length && this.checkedPositions.every(
            position => position.status === PositionStatus.DRAFT
          );

          this.cd.detectChanges();
        })
      );

      // Устанавливаем состояние царь-чекбокса при переходам по страницам
      this.form.get("checked").setValue(this.isAllPositionsSelected || this.isUncheckedPositionsExist);

      // Устанавливаем состояние чекбокса групп при переходам по страницам
      this.formPositions.controls.forEach((formGroup: FormGroup) => {
        const isFormGroupHavePositions = formGroup?.get('positions')?.value;
        if (isFormGroupHavePositions) {
          formGroup.get("checked").setValue(this.isAllPositionsInGroupSelected(formGroup) || this.isUncheckedPositionsInGroupExist(formGroup));
        }
      });
    }
  }

  ngOnDestroy() {
  }

  asGroup(positionList: RequestPositionList): RequestGroup | null {
    return positionList.entityType !== "GROUP" ? null : positionList as RequestGroup;
  }

  asPosition(positionList: RequestPositionList): RequestPosition | null {
    return positionList.entityType !== "POSITION" ? null : positionList as RequestPosition;
  }

  navigateToPosition(position: RequestPositionList, e: MouseEvent): void {
    if (!(e.target instanceof HTMLInputElement) && !e.ctrlKey && !e.shiftKey) {
      this.router.navigateByUrl(this.getPositionUrl(position));
      e.preventDefault();
    }
  }

  isPositionDisabled(position: RequestPosition): boolean {
    return position.inQueue || position.status === PositionStatus.CANCELED || position.status === PositionStatus.NOT_RELEVANT ||
      (position.status === PositionStatus.PROOF_OF_NEED && this.user.isCustomer());
  }

  getPositionUrl(position: RequestPositionList): UrlTree {
    return this.router.createUrlTree([position.id], { relativeTo: this.route });
  }

  select(type: "all" | "none" | "groups" | "positions") {
    if (["all", "none"].indexOf(type) >= 0) {
      this.form.get("checked").setValue(type === "all");
    }
    if (["groups", "positions"].indexOf(type) >= 0) {
      this.formPositions.controls.forEach(c => c.get("checked").setValue(
        !!c.get("positions") === (type === "groups")
      ));
    }
  }

  showPositionSelectionBlock() {
    return this.selectedPageWithDisabledPositions ||
           this.checkedPositionsOfCurrentPage.length > 0 &&
           (this.checkedPositionsOfCurrentPage.length === (this.pageSize - this.disabledPositions.length) &&
           this.pageSize < this.totalCountWithoutNotRelevantAndCanceled) || this.useAllPositions;
  }

  toggleGroups(folded: boolean) {
    this.formPositions.controls
      .filter(c => c.get("positions") && this.asFormArray(c.get("positions")).controls.length > 0)
      .forEach(c => c.get("folded").setValue(folded));
  }

  asFormArray(control: AbstractControl) {
    return control as FormArray;
  }

  onPublishPositions() {
    const positionIds = this.checkedPositions.map(item => item.id);
    const useAllPositions = this.useAllPositions;

    this.publishPositions.emit({positionIds, useAllPositions});
  }

  onApprovePositions() {
    const positionIds = this.checkedPositions.map(item => item.id);
    const useAllPositions = this.useAllPositions;

    this.approvePositions.emit({positionIds, useAllPositions});

    this.resetSelectedPositions();
  }

  onRejectPositions(rejectionMessage?: string) {
    const positionIds = this.checkedPositions.map(item => item.id);
    const useAllPositions = this.useAllPositions;

    this.rejectPositions.emit({positionIds, rejectionMessage, useAllPositions});
  }

  submitPositionReject() {
    if (this.positionRejectForm.valid) {
      const comment = this.positionRejectForm.get('comment').value;
      const documents = this.positionRejectForm.get('documents').value;
      const positionIds = this.checkedPositions.map(item => item.id);

      this.onRejectPositions(comment);

      if (documents.length && this.user.isCustomerApprover()) {
        this.store.dispatch(new ApproverAttachDocuments(this.request.id, positionIds, documents, this.useAllPositions));
      }
    }

    this.checkedPositions = [];
    this.rejectPositionModal.close();
    this.positionRejectForm.reset({
      comment: '',
      documents: []
    });
  }

  onAttachDocumentsToPositions() {
    const files = this.form.get('documents').value;
    const positionIds = this.checkedPositions.map(item => item.id);
    const useAllPositions = this.useAllPositions;
    const activeFilters = this.filterForm?.value;

    if (files?.length) {
      this.attachDocuments.emit({positionIds, files, useAllPositions, activeFilters});
      this.addDocumentsModal.close();
    } else {
      this.invalidUploadDocument = true;
    }
  }

  openFileUploadToPositionsModal() {
    this.form.get('documents').setValue(null);
    this.invalidUploadDocument = false;
    this.addDocumentsModal.open();
  }

  openRequestNameEditModal() {
    this.requestNameForm.get('requestName').setValue(this.request.name);
    this.editRequestNameModal.open();
  }

  onSaveRequestName() {
    if (this.requestNameForm.valid) {
      this.saveRequestName.emit(this.requestNameForm.get('requestName').value);
      this.editRequestNameModal.close();
    }
  }

  onDragAndDropDocumentsToPosition(positionId, files: File[]) {
    const positionIds = [positionId];

    if (files.filter(f => f.type).length) {
      this.attachDocuments.emit({ positionIds, files: files.filter(f => f.type) });
    }
  }

  resetSelectedPositions() {
    this.formPositionsFlat.filter(formGroup => formGroup.get("checked").setValue(false));
  }

  private fetchForm(positions: RequestPositionList[], position?: RequestPositionList) {
    const formGroup = this.fb.group({ checked: false, folded: false, documents: null });

    if (positions) {
      formGroup.addControl("positions", this.fb.array(
        positions.map(p => this.fetchForm((p as RequestGroup).positions, p))
      ));
    }

    if (position) {
      formGroup.addControl("position", this.fb.control(position));
      if (this.asPosition(position) && this.isPositionDisabled(this.asPosition(position))) {
        // Удаляем обработанные позиции из списка отмеченных
        const positionIndex = this.checkedPositions.findIndex(checkedPosition => checkedPosition.id === position.id);

        if (positionIndex !== -1) {
          this.checkedPositions.splice(positionIndex, 1);
        }

        formGroup.get("checked").disable();
      }
    }

    return formGroup;
  }

  getProcedureTypeLabel(procedureType) {
    switch (procedureType) {
      case 'byPosition':
        return 'Попозиционная закупка';
      case 'twoStage':
        return 'Двухэтапный отбор';
      case 'byPrice':
        return 'Прайсовая закупка';
      default:
        return 'Попозиционная закупка';
    }
  }

  clickRejectPositions() {
    this.user.isCustomerApprover() ? this.onRejectPositions() : this.rejectPositionModal.open();
  }

  trackByFormPositionId = (i, c: AbstractControl) => c.get("position").value.id;

  onPageIndexChanged($event) {
    this.filter.emit({page: $event});
    this.subs.forEach(sub => {
      if (!sub?.closed) {
        sub.unsubscribe();
      }
    });
  }

  proceedRequestPositionsFromExcel() {
    this.requestService.proceedRequestPositionsFromExcel(this.request.id, this.user.isCustomer() ? 'customer' : 'backoffice')
      .subscribe(_ => {
        this.store.dispatch(new ToastActions.Success('Заявка принята'));
        this.refreshAll.emit();
      }, _ => {
        this.store.dispatch(new ToastActions.Error('Не удалось принять заявку'));
      });
  }

  deleteRequestPositionsFromExcel() {
    this.requestService.deleteRequestPositionsFromExcel(this.request.id, this.user.isCustomer() ? 'customer' : 'backoffice')
      .subscribe((data: any) => {
        this.store.dispatch(new ToastActions.Success('Заявка была отклонена'));
        if (data.isRequestDeleted) {
          if (this.user.isCustomer()) {
            this.router.navigate(['requests', 'customer']);
          } else {
            this.router.navigate(['positions']);
          }
        } else {
          this.refreshAll.emit();
        }
      }, _ => {
        this.store.dispatch(new ToastActions.Error('Не удалось отклонить заявку'));
      });

  }
}
