import * as moment from 'moment';
import { CustomValidators } from './../../../shared/forms/custom.validators';
import { saveAs } from 'file-saver/src/FileSaver';
import { UserInfoService } from './../../../user/service/user-info.service';
import { PositionStatus } from './../../../request/common/enum/position-status';
import { PositionStatusesLabels } from './../../../request/common/dictionaries/position-statuses-labels';
import { OffersApproveGroupModel } from '../../models/offers-approve-group.model';
import { ProcedureService } from './../../../request/back-office/services/procedure.service';
import { TechnicalCommercialProposalPositionStatusLabel } from './../../../request/common/enum/technical-commercial-proposal-position-status-label';
import { ProcedureState } from './../../states/procedure.state';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Select } from '@ngxs/store';
import { Store } from '@ngxs/store';
import { IProposalsFilters, IAvailableProposalsFilters } from './../../models/proposals-filters';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subject, Observable } from "rxjs";
import { Request } from "../../../request/common/models/request";
import { startWith, takeUntil, tap } from "rxjs/operators";
import { Uuid } from "../../../cart/models/uuid";
import { UxgModalComponent, UxgPopoverComponent } from "uxg";
import { FeatureService } from "../../../core/services/feature.service";
import { RequestPosition } from "../../../request/common/models/request-position";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { FormArray, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { animate, style, transition, trigger } from "@angular/animations";
import { Validators } from '@angular/forms';
import { getCurrencySymbol } from "@angular/common";
import { StateStatus } from "../../../request/common/models/state-status";
import { ProposalSource } from "../../../request/back-office/enum/proposal-source";
import { Procedure } from "../../../request/back-office/models/procedure";
import { ProcedureAction } from "../../../request/back-office/models/procedure-action";
import { ProposalsView } from "../../../shared/models/proposals-view";
import { GridSupplier } from "../../../shared/components/grid/grid-supplier";
import { Proposal } from "../../../shared/components/grid/proposal";
import { GridRowComponent } from "../../../shared/components/grid/grid-row/grid-row.component";
import { ScrollPositionService } from "../../../shared/services/scroll-position.service";
import { CommonProposal, CommonProposalByPosition, CommonProposalItem } from "../../../request/common/models/common-proposal";
import { ProposalSourceLabels } from "../../../request/common/dictionaries/proposal-source-labels";
import { ProposalHelperService } from "../../../shared/components/grid/proposal-helper.service";
import { ProcedureActions } from '../../actions/procedure.actions';
import { FilterService } from 'src/app/core/services/filter.service';
import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-procedure-proposal-view',
  templateUrl: './procedure-proposal-view.component.html',
  styleUrls: ['procedure-proposal-view.component.scss'],

  animations: [trigger('sidebarHide', [
    transition(':leave', animate('300ms ease', style({ 'max-width': '0', 'margin-left': '0' }))),
  ])],
})
export class ProcedureProposalViewComponent extends OnDestroyDirective implements OnDestroy, AfterViewInit, OnChanges, OnInit {
  @Select(ProcedureState.availableFilters) availableFilters$: Observable<IAvailableProposalsFilters>;
  @Select(ProcedureState.offersApproveGroups) offersApproveGroups$: Observable<OffersApproveGroupModel[]>;
  @Select(ProcedureState.offersApproveGroup) offersApproveGroup$: Observable<OffersApproveGroupModel>;

  @ViewChildren(GridRowComponent) gridRowsComponent: QueryList<GridRowComponent>;
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  @ViewChild('createGroupModal') createGroupModal: UxgModalComponent;
  @ViewChild('approveReferenceModal') approveReferenceModal: UxgModalComponent;
  @ViewChild('changeApproveTypeModal') changeApproveTypeModal: UxgModalComponent;
  @ViewChildren('viewPopover') viewPopover: QueryList<UxgPopoverComponent>;
  @ViewChildren('selectPopover') selectPopoverRef: QueryList<UxgPopoverComponent>;
  @Input() proposals: CommonProposal[];
  @Input() filters: any;
  @Input() proposalsByPositions: CommonProposalByPosition[];
  @Input() availablePositions: RequestPosition[];
  @Input() procedureCreationPositions: RequestPosition[];
  @Input() positions: RequestPosition[];
  @Input() procedure: Procedure;
  @Input() status: StateStatus;
  @Input() request: Request;
  @Input() groupId: Uuid;
  @Input() proposalGroupId: string;
  @Input() procedureUid?: Uuid;
  @Input() source: ProposalSource;
  @Input() contragentsWithTp: ContragentShortInfo[];
  @Input() canRollback: (position: RequestPosition, rollbackDuration: number) => boolean;
  @Input() isCanApprove: boolean;

  @Output() downloadTemplate = new EventEmitter();
  @Output() uploadTemplate = new EventEmitter<File[]>();
  @Output() downloadAnalyticalReport = new EventEmitter();
  @Output() publishProposals = new EventEmitter<{selectedPositionTCPs: CommonProposalItem[], filterForm: any}>();
  @Output() updateProcedures = new EventEmitter();
  @Output() rollback = new EventEmitter<RequestPosition>();
  @Output() saveProposalItem = new EventEmitter<{ item: Partial<CommonProposalItem>, proposal: CommonProposal }>();
  @Output() viewChange = new EventEmitter<ProposalsView>();
  @Output() create = new EventEmitter<{ proposal: Partial<CommonProposal>, items?: CommonProposalItem[] }>();
  @Output() edit = new EventEmitter<{ proposal: Partial<CommonProposal> & { id: Uuid }, items?: CommonProposalItem[] }>();
  @Output() procedurePositionsSelected = new EventEmitter<Uuid[]>();
  @Output() filterProcedureCreationPositions = new EventEmitter<string>();

  view: ProposalsView = "grid";
  gridRows: ElementRef[];
  stickedPosition: boolean;
  files: File[] = [];
  addProposalPositionPayload: {
    proposal: CommonProposal,
    proposalPosition: CommonProposalItem,
    position: RequestPosition,
    supplier?: ContragentShortInfo
  };
  form: FormGroup = this.fb.group({
    checked: false,
    positions: []
  });
  invalidUploadTemplate = false;
  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  prolongModalPayload: Procedure;
  proposalModalData: CommonProposalByPosition;
  rollbackDuration = 10 * 60;
  editingProposal: CommonProposal;
  useAllPositions = false;
  newProposalGroupName: string = null;
  tradingScheme: 'TRADE' | 'AGENT' = 'TRADE';
  approveType: "MATRIX" | "REFERENCE" = 'MATRIX';
  isHideContragent: 'true' | 'false' = 'true';
  isLoading = false;
  selectedSuppliers: GridSupplier[] = [];
  resetSelectedSuppliers: boolean;
  selectedPositionTCPs: CommonProposalItem[] = [];
  filterForm = this.fb.group({
    requestPositionName: '',
    offersApproveGroupName: '',
    contragentUsers: [[]],
    responsibleUsers: [[]],
    requestsNumbers: [[]],
    statuses: [[]],
  });
  tradingSchemeForm = this.fb.group({
    tradingScheme: ['TRADE'],
    approveType: this.approveType,
    isHideContragent: this.isHideContragent,
  });
  approveTypeForm = this.fb.group({
    approveType: "MATRIX",
  });
  offerIncreaseForm = this.fb.group({
    absolute: [null, [Validators.required, Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$")]],
    percent: [null, [Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$")]]
  });
  increaseETPFormGroup = this.fb.group({
    increaseType: [null, Validators.required],
    increaseValue: [null, [Validators.required, Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$")]],
    priceWithoutVat: null,
  });
  increaseType = 'absolute';
  groupsColumnHeaders = [
    {name: 'Наименование группы', alias: 'name', isVisible: true, customStyles: {'min-width': '355px', 'flex-grow': 0}},
    {name: 'Параметры', alias: 'params', isVisible: true},
    {name: '', alias: 'link', isVisible: true, customStyles: {'flex-grow': 0}},
  ];
  uploadedAnalyticReport: File;
  increaseForAll = false;

  readonly getCurrencySymbol = getCurrencySymbol;
  readonly sourceLabels = ProposalSourceLabels;
  readonly fetchFilters$ = new Subject<{ filters?: IProposalsFilters }>();
  readonly TechnicalCommercialProposalPositionStatusLabel = TechnicalCommercialProposalPositionStatusLabel;
  readonly PositionStatusesLabels = PositionStatusesLabels;
  readonly PositionStatus = PositionStatus;
  readonly proposalSource = ProposalSource;

  hasWinnerFunction = (proposal): boolean => proposal.items?.some(item => item.status === "APPROVED");

  get selectedPositions(): CommonProposalByPosition[] {
    return (this.form.get('positions') as FormArray).controls
      ?.filter(({ value }) => value?.checked)
      .map(({ value }) => (value.item)) || [];
  }

  get totalProposals(): number {
    return this.proposals?.length * this.positions?.length || 0;
  }

  get allPositionsHasTCPAgreement() {
    return this.positions.every(position => position.status === PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT);
  }

  get isCreateGroupOfferDisabled() {
    return (!this.selectedPositions?.length && !this.selectedPositionTCPs?.length && !this.selectedSuppliers?.length)
      || (this.status) !== 'received'
      || this.procedure?.isWaitingForImportOffers;
  }

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public featureService: FeatureService,
    public helper: ProposalHelperService,
    private store: Store,
    public filterService: FilterService,
    private router: Router,
    private procedureService: ProcedureService,
    public userService: UserInfoService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit() {
    this.increaseETPFormGroup.get('increaseType').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((increaseType: string) => {
        this.increaseETPFormGroup.get('increaseValue').reset();
        this.increaseETPFormGroup.get('increaseValue').setValidators([
          Validators.required,
          Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$"),
          (increaseType === 'RELATIVE')
            ? CustomValidators.increaseValuePercent
            : CustomValidators.increaseValueAbsolute(this.increaseETPFormGroup.get('priceWithoutVat').value)
        ]);
        this.increaseETPFormGroup.get('increaseValue').updateValueAndValidity();
      });
  }

  ngOnChanges({ proposalsByPositions, offersApproveGroup, proposalGroupId }: SimpleChanges) {
    if (this.proposalsByPositions?.length && (proposalsByPositions?.currentValue || proposalGroupId?.currentValue || offersApproveGroup?.currentValue)) {
      this.form = this.fb.group({
        checked: false,
        positions: this.fb.array(this.proposalsByPositions.map((item: CommonProposalByPosition) => {
          const form = this.fb.group({ checked: false, item });
          if (
            this.isReviewed(item) ||
            this.isOnReview(item) ||
            this.isInQueue(item) ||
            this.isPositionOnApprove(item) ||
            (!this.isPositionOnProposalsPreparation(item) && this.source === 'COMMERCIAL_PROPOSAL') ||
            item.items.length === 0
          ) {
            form.get("checked").disable({onlySelf: true, emitEvent: false});
          }
          return form;
        }))
      });

      if (!this.groupId) {
        this.disablePositionsCheckboxes();
      } else {
        this.disablePositionsCheckboxesByStatus();
      }

      this.offersApproveGroup$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(data => {
        if (data) {
          this.tradingScheme = data?.scheme;
          this.approveType = data?.approveType;
          this.proposalGroupId = data?.id;
          this.cd.detectChanges();

          // устанавливаем прнятую торговую схему из данных группы
          this.tradingSchemeForm.patchValue({
            tradingScheme: this.tradingScheme
          });
        }
      });

      this.form.get('positions').valueChanges.pipe(takeUntil(this.destroy$)).subscribe((positions: any[]) => {
        positions.forEach((position: any, index: number) => {
          const positionsArray = this.form.get('positions') as FormArray;
          const selectedPosition = this.selectedPositions?.length ? this.selectedPositions[0].position : null;
          // Запрещаем выбор позиций из разных заявок у агентской схемы
          if (selectedPosition && this.tradingScheme === 'AGENT' && position.item.position.request?.id !== selectedPosition.request?.id) {
            positionsArray.at(index).get("checked").disable({onlySelf: true, emitEvent: false});
          }
        });
      });
    }
  }

  ngAfterViewInit() {
    this.gridRowsComponent.changes.pipe(
      startWith(this.gridRowsComponent),
      tap(() => this.gridRows = this.gridRowsComponent.reduce((gridRows, c) => [...gridRows, ...c.gridRows], [])),
      tap(() => this.cd.detectChanges()),
      takeUntil(this.destroy$)
    ).subscribe();

    this.cd.detectChanges();

    this.store.dispatch(
      this.proposalGroupId ?
        new ProcedureActions.FetchProposalAvailableFilters(this.groupId, this.proposalGroupId) :
        new ProcedureActions.FetchProposalAvailableFilters(this.groupId))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterService.searchByAvailableFilters(this.availableFilters$);
      });

    this.filterService.subscribeOnFiltersChange(this.fetchFilters$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        const filterPayload = { offersApproveGroupId: this.proposalGroupId, ...filters.filters};

        this.store.dispatch(new ProcedureActions.FetchProposals(
          this.groupId,
          false,
          this.proposalGroupId ? filterPayload : { onlyWithoutOffersApproveGroups: true, ...filters.filters })
        );

        if (!this.proposalGroupId) {
          this.store.dispatch(new ProcedureActions.FetchOffersApproveGroups(
            this.groupId,
            this.procedureUid,
            this.proposalGroupId ? filterPayload : { onlyWithoutOffersApproveGroups: false, ...filters.filters })
          );
        }
        this.resetSelectedProposalsAndPositions();
      });

    if (!this.proposalGroupId) {
      this.store.dispatch(new ProcedureActions.FetchOffersApproveGroups(this.groupId, this.procedureUid))
        .pipe(takeUntil(this.destroy$))
        .subscribe(_ => {
          this.cd.detectChanges();
        });
    }
  }

  switchView(view: ProposalsView) {
    this.view = view;
    this.viewChange.emit(view);
    this.viewPopover?.first.hide();
  }

  getContragents(proposals: CommonProposal[]): ContragentShortInfo[] {
    return proposals.map(proposal => proposal.supplier);
  }

  isReviewed = ({ items }: CommonProposalByPosition) => items.some((position) => ['APPROVED', 'REJECTED'].includes(position?.status)) && items.length > 0;
  isOnReview = ({ items }: CommonProposalByPosition) => items.every(position => ['SENT_TO_REVIEW'].includes(position?.status)) && items.length > 0;
  isInQueue = ({ items }: CommonProposalByPosition) => items.some(position => position?.inQueue === true) && items.length > 0;
  isSentToEdit = ({ items }: CommonProposalByPosition) => items.some(position => ['SENT_TO_EDIT'].includes(position?.status)) && items.length > 0;
  isDraft = ({ items }: CommonProposalByPosition): boolean => items.every(position => ['NEW'].includes(position?.status));
  isPositionOnProposalsPreparation = ({ position }: CommonProposalByPosition): boolean => ['PROPOSALS_PREPARATION'].includes(position?.status);
  isPositionOnTCPAgreement = ({ position }: CommonProposalByPosition): boolean => ['TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT'].includes(position?.status);
  isPositionWinnerSelected = ({ position }: CommonProposalByPosition): boolean => ['TCP_WINNER_SELECTED'].includes(position?.status);
  isPositionOnTCPPreparation = ({ position }: CommonProposalByPosition): boolean => ['TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION'].includes(position?.status);
  isPositionOnApprove = ({ position }: CommonProposalByPosition): boolean => position?.status === 'ON_CUSTOMER_APPROVAL';
  isAddContragentDisabled = () => this.proposalsByPositions?.length > 0 && (this.proposalsByPositions.every(
    item => (this.isOnReview(item) || this.isReviewed(item)) && item.items.length > 0
  ) || this.proposalsByPositions?.some((item) => [
    'TECHNICAL_PROPOSALS_PREPARATION',
    'TECHNICAL_PROPOSALS_AGREEMENT'
  ].includes(item.position?.status)))

  addProposalPosition(proposal: CommonProposal, position: RequestPosition, proposalPosition?: CommonProposalItem) {
    this.addProposalPositionPayload = { proposal, position, proposalPosition };
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
    } else {
      this.uploadTemplateModal.close();
      this.uploadTemplate.emit(this.files);
    }
  }

  suppliers(proposals: CommonProposal[]): GridSupplier[] {
    return proposals.reduce((suppliers: GridSupplier[], proposal) => {
      [false, true]
        .filter(hasAnalogs => proposal.items.some(({ isAnalog }) => isAnalog === hasAnalogs) || proposal.items.length === 0 && !hasAnalogs)
        .forEach(hasAnalogs => suppliers.push({ ...proposal.supplier, hasAnalogs, source: proposal.source }));
      return suppliers;
    }, []);
  }

  convertProposals(proposals: CommonProposal[]) {
    return proposals.reduce((result: Proposal[], proposal) => {
      [false, true]
        .filter(hasAnalogs => proposal.items.some(({ isAnalog }) => isAnalog === hasAnalogs))
        .forEach(() => result.push(new Proposal(proposal)));
      return result;
    }, []);
  }

  trackById = (i, { id }: CommonProposal | Procedure) => id;
  trackByProposalByPositionId = (i, { position }: CommonProposalByPosition) => position?.id || i;
  converProposalPosition = ({ items }: CommonProposalByPosition) => items.map(p => new Proposal(p));
  getProposalItemBySupplier = (positionProposals: CommonProposalByPosition) => ({ id, hasAnalogs }: GridSupplier) => {
    const proposal = positionProposals.items.find((p) => p.supplierContragent.id === id && p.isAnalog === hasAnalogs);
    return proposal ? proposal : null;
  }
  getProposalByProposalPosition = ({ id }: CommonProposalItem, proposals: CommonProposal[]) => proposals.find(({ items }) => items.find(item => item.id === id));
  getProposalBySupplier = ({ id }: ContragentShortInfo, proposals: CommonProposal[]) => proposals.find(({ supplier }) => supplier.id === id);
  getSupplierByProposalItem = (proposals: CommonProposal[]) => (proposalItem: Proposal<CommonProposalItem>) => {
    return proposals.find(({ items }) => items.find(({ id }) => proposalItem.id === id)).supplier;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createGroup() {
    this.isLoading = true;
    this.procedureService.createProposalGroup(
      this.newProposalGroupName,
      this.useAllPositions,
      this.filterForm.value,
      this.selectedSuppliers.map(sup => this.getProposalBySupplier(sup, this.proposals).id),
      this.selectedPositions.map(position => position.position.id),
      this.selectedPositionTCPs.map(tcp => tcp.id),
      this.tradingScheme,
      this.approveType,
      this.isHideContragent,
      this.groupId
    ).subscribe(_ => {
      this.isLoading = false;
      this.store.dispatch(new ToastActions.Success('Группа предложений на согласование успешно создана'));
      this.createGroupModal.close();
      this.resetSelectedProposalsAndPositions();
      this.store.dispatch(new ProcedureActions.FetchOffersApproveGroups(this.groupId, this.procedureUid)).subscribe();
      this.store.dispatch(new ProcedureActions.FetchProposals(this.groupId, false, {...this.filterForm.value, onlyWithoutOffersApproveGroups: true})).subscribe();
    }, () => {
      this.isLoading = false;
      this.store.dispatch(new ToastActions.Error('Не удалось создать группу предложений на согласование'));
    });
  }

  applyTradingScheme() {
    this.tradingScheme = this.tradingSchemeForm.value.tradingScheme;
    this.approveType = this.tradingSchemeForm.value.approveType;
    this.isHideContragent = this.tradingSchemeForm.value.isHideContragent;
    this.resetSelectedProposalsAndPositions();

    if (!this.proposalGroupId) {
      this.disablePositionsCheckboxes();
    }
  }

  // Смена типа согласования
  applyApproveType() {
    this.tradingSchemeForm.patchValue({
      approveType: this.approveTypeForm.value.approveType
    });
    this.approveType = this.approveTypeForm.value.approveType;
  }

  // Выбор одного предложения
  onSelectPositionTCP(proposal: CommonProposalItem, clearSuppliers = true) {
    if (this.tradingScheme === 'AGENT' || proposal.isAnalog) {
    // Для агентской схема или аналогов (чекбоксы)
      const selectedProposalIndex = this.selectedPositionTCPs.findIndex(tcp => tcp.id === proposal.id);
      selectedProposalIndex === -1 ? this.selectedPositionTCPs.push(proposal) : this.selectedPositionTCPs.splice(selectedProposalIndex, 1);
    } else {
      // Для торговой схемы (радиокнопки)
      if (this.selectedPositionTCPs.find(tcp => tcp.id === proposal.id && tcp.requestPositionId === proposal.requestPositionId)) {
        this.selectedPositionTCPs = this.selectedPositionTCPs.filter(tcp => (tcp.requestPositionId !== proposal.requestPositionId || tcp.isAnalog));
      }
      this.selectedPositionTCPs.push(proposal);
    }

    console.log(this.selectedPositionTCPs);

    if (clearSuppliers) {
      this.selectedSuppliers.length = 0;
    }
  }

  // Выбор поставщика (столбец)
  onSupplierSelect(supplier: GridSupplier) {
    this.resetSelectedProposalsAndPositions();
    this.selectedSuppliers = [supplier];
  }

  // Выбор позиции (строка)
  onPositionSelected(event: boolean, proposalsByPos: CommonProposalByPosition) {
    this.selectedSuppliers.length = 0;
    this.resetSelectedSuppliers = !this.resetSelectedSuppliers;

    // При выборе позиции сохраняем в массив айди всех предложений по позиции
    this.selectedPositionTCPs = this.selectedPositionTCPs.filter(proposal => proposal.requestPositionId !== proposalsByPos.position.id);

    proposalsByPos.items.map(item => {
      if (event) { this.onSelectPositionTCP(item); }
      item._selected = event;
    });

    if (proposalsByPos.position) { proposalsByPos.position.checked = event; }
  }

  isPositionEditable(proposalsByPos) {
    return !this.isReviewed(proposalsByPos)
        && !this.isOnReview(proposalsByPos)
        && !this.isInQueue(proposalsByPos)
        // редактирование доступно только для позиций в статусе "подготовка ТКП" (isprocessor-822)
        && proposalsByPos?.position?.status === PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION
        && (this.proposalGroupId ? !this.isDraft(proposalsByPos) : true);
  }

  // Скачиваем аналитическую справку
  downloadReference() {
    if (this.proposalGroupId) {
      this.procedureService.downloadAnalyticReferenceByGroupId(this.proposalGroupId)
        .subscribe((response: Blob) => {
          saveAs(response, `AnalyticReport.xlsx`);
      });
    } else {
      this.procedureService.downloadAnalyticReferenceByProcedureId(this.procedureUid)
      .subscribe((response: Blob) => {
        saveAs(response, `AnalyticReport.xlsx`);
      });
    }
  }

  // Загружаем свою аналитическую справку
  uploadReference(event) {
    this.uploadedAnalyticReport = event.target.files[0];
    if (!this.uploadedAnalyticReport) {
      return;
    }
    this.procedureService.uploadAnalyticReference(this.proposalGroupId, this.uploadedAnalyticReport)
      .subscribe(_ => {
        this.store.dispatch(new ToastActions.Success('Аналитическая справка успешно загружена!'));
      }, (e) => {
        this.store.dispatch(new ToastActions.Error(e && e.detail));
      });
  }

  // Удаляем свою аналитическую справку
  removeAnalyticReference() {
    this.procedureService.removeAnalyticReference(this.proposalGroupId)
      .subscribe(_ => {
        this.store.dispatch(new ToastActions.Success('Аналитическая справка успешно удалена!'));
        this.uploadedAnalyticReport = null;
        this.store.dispatch(new ProcedureActions.FetchProposals(this.groupId, false, { offersApproveGroupId: this.proposalGroupId }));
      }, (e) => {
        this.store.dispatch(new ToastActions.Error(e && e.error?.detail || 'Не удалось удалить аналитическую справку'));
      });
  }

  // Кнопка сформировать предложение
  createGroupOffer() {
    // @TODO логи удалить после теста
    console.log(this.selectedPositions);
    console.log(this.selectedPositionTCPs);
    console.log(this.selectedSuppliers);
    const isSelectedTCPFromDifferentRequests = this.selectedPositionTCPs.length && this.selectedPositionTCPs.some(tcp => tcp.requestId !== this.selectedPositionTCPs[0].requestId);
    if (isSelectedTCPFromDifferentRequests && this.tradingScheme === 'TRADE' && this.approveType === 'REFERENCE') {
      this.changeApproveTypeModal.open();
    } else {
      this.createGroupModal.open();
    }
  }

  // Кнопка Отправить на согласование
  publishSelectedProposals(isShowModal = false) {
    if (this.approveType === 'REFERENCE' && isShowModal) {
      this.approveReferenceModal.open();
    } else {
      this.publishProposals.emit({
        selectedPositionTCPs: this.selectedPositionTCPs,
        filterForm: {offersApproveGroupId: this.proposalGroupId, ...this.filterForm.value }
      });
      this.approveReferenceModal?.close();
      this.resetSelectedProposalsAndPositions();
    }
  }

  // Добавление наценки
  increaseOffer() {
    this.procedureService.addOfferIncrease(
      this.proposalGroupId,
      this.selectedPositionTCPs.map(tcp => tcp.id),
      this.offerIncreaseForm.get('percent').value,
      this.offerIncreaseForm.get('absolute').value,
      this.increaseForAll
    ).subscribe(_ => {
      this.store.dispatch(new ToastActions.Success('Наценки успешно применены!'));

      this.store.dispatch(new ProcedureActions.FetchProposals(
        this.groupId,
        true,
        { ...this.filterForm.value, offersApproveGroupId: this.proposalGroupId}
      ));
    }, (e) => {
      this.store.dispatch(new ToastActions.Error(e.error?.detail || 'Не удалось применить наценки'));
    });
  }

  // Смена типа наценки
  increaseTypeChanged(increaseType: string) {
    if (increaseType === 'absolute') {
      this.offerIncreaseForm.get('percent').clearValidators();
      this.offerIncreaseForm.get('percent').reset();
      // @TODO сделать валидацию минимальной скидки CustomValidators.increaseValueAbsolute
      this.offerIncreaseForm.get('absolute').setValidators([Validators.required, Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$")]);
    }
    if (increaseType === 'percent') {
      this.offerIncreaseForm.get('absolute').clearValidators();
      this.offerIncreaseForm.get('absolute').reset();
      this.offerIncreaseForm.get('percent').setValidators([Validators.required, Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$"), CustomValidators.increaseValuePercent]);
    }
    this.offerIncreaseForm.updateValueAndValidity();
    this.cd.detectChanges();
  }

  // Запрещаем выбор позиций у торговой схемы (isprocessor-939)
  private disablePositionsCheckboxes() {
    const positions = this.form.get('positions') as FormArray;
    if (this.tradingScheme === 'TRADE') {
      positions.value?.forEach((pos, index) => {
        positions.at(index).get("checked").disable({onlySelf: true, emitEvent: false});
      });
    } else {
      positions.value?.forEach((pos, index) => {
        positions.at(index).get("checked").enable({onlySelf: true, emitEvent: false});
      });
    }
  }

  private disablePositionsCheckboxesByStatus() {
    const positions = this.form.get('positions') as FormArray;

    if (this.tradingScheme === 'TRADE') {
      positions.value.forEach((data, index) => {
        positions.at(index).get("checked").disable({onlySelf: true, emitEvent: false});

        if (this.isPositionWinnerSelected(data.item) || this.isPositionOnTCPAgreement(data.item) || this.isInQueue(data.item)) {
          this.proposalsByPositions[index].position.positionProposalsDisabled = true;
        }
      });
    } else {
      positions.value.forEach((data, index) => {
        if (this.isPositionWinnerSelected(data.item) || this.isPositionOnTCPAgreement(data.item) || this.isInQueue(data.item)) {
          positions.at(index).get("checked").disable({onlySelf: true, emitEvent: false});
          this.proposalsByPositions[index].position.positionProposalsDisabled = true;
        } else {
          // todo блочить радиокнопки предложений если статус SENT_TO_EDIT
        }
      });
    }
  }

  // Сбрасываем выбранные позиции и предложения
  public resetSelectedProposalsAndPositions() {
    this.resetSelectedPositions();

    this.selectedSuppliers = [];
    this.resetSelectedSuppliers = !this.resetSelectedSuppliers;
    this.selectedPositionTCPs = [];
  }

  // Сбрасываем выбранные позиции
  private resetSelectedPositions() {
    this.form.get('positions').value?.forEach((position: any, index: number) => {
      (this.form.get('positions') as FormArray).at(index).get("checked").setValue(false);
    });
    this.proposalsByPositions?.forEach(proposal => {
      proposal.position.checked = false;
    });
    this.selectedPositions.length = 0;
  }

  // Полчаем код статуса позиции
  public getStatusCode(proposalsByPos: CommonProposalByPosition) {
    if (!this.isPositionOnApprove(proposalsByPos)) {
      if (this.isReviewed(proposalsByPos) && !this.isInQueue(proposalsByPos)) {
        return 'SELECTED_VINNER';
      }
      if (this.isOnReview(proposalsByPos) && !this.isInQueue(proposalsByPos)) {
        return 'SENT_TO_REVIEW';
      }
      if (this.isSentToEdit(proposalsByPos) && !this.isInQueue(proposalsByPos)) {
        return 'SENT_TO_EDIT';
      }
      if (this.isDraft(proposalsByPos) && !this.isInQueue(proposalsByPos)) {
        return 'DRAFT';
      }
      if (this.isInQueue(proposalsByPos)) {
        return 'IN_QUEUE';
      }
    }
  }

  // проверяем возможность показа кнопок +Контрагент и + ТКП из шаблона
  public canShowAddTkpButtons(offersApproveGroups: OffersApproveGroupModel[]) {
    return (offersApproveGroups.length && this.positions.length) || !offersApproveGroups.length;
  }

  // Сохранение наценок у предложения с ЭТП
  public saveETPIncrease(proposal: CommonProposal) {
    const formIncreaseValues = this.increaseETPFormGroup.getRawValue();
    delete formIncreaseValues.priceWithoutVat;
    const item = {
      ...proposal.items[0],
      ...formIncreaseValues
    };
    this.saveProposalItem.emit({
      item: item,
      proposal: proposal
    });
    this.resetSelectedProposalsAndPositions();
    this.increaseETPFormGroup.reset();
    this.proposalModalData = null;
  }

  // Открываем модалку с инфой о предложении
  public onProposalShow(item, proposalsByPos) {
    this.proposalModalData = {
      id: this.getProposalByProposalPosition(item, this.proposals)?.id,
      position: proposalsByPos.position,
      items: [item]
    };
    this.increaseETPFormGroup.patchValue({
      increaseType: this.proposalModalData.items[0]?.increase?.type,
      increaseValue: this.proposalModalData.items[0]?.increase?.value,
      priceWithoutVat: this.proposalModalData.items[0]?.priceWithoutVat,
    });
  }

  // проверяет есть предложения на доработке
  public hasSendToEdit(): boolean {
    let hasSendToEdit = false;
    this.proposalsByPositions?.forEach(proposal => {
      if (this.isSentToEdit(proposal) && !this.isInQueue(proposal)) {
        hasSendToEdit = true;
      }
    });
    return hasSendToEdit;
  }
}
