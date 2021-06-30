import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from "rxjs";
import { Request } from "../../../../common/models/request";
import { startWith, takeUntil, tap } from "rxjs/operators";
import { Uuid } from "../../../../../cart/models/uuid";
import { UxgModalComponent, UxgPopoverComponent } from "uxg";
import { FeatureService } from "../../../../../core/services/feature.service";
import { RequestPosition } from "../../../../common/models/request-position";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { animate, style, transition, trigger } from "@angular/animations";
import { getCurrencySymbol } from "@angular/common";
import { StateStatus } from "../../../../common/models/state-status";
import { ProposalSource } from "../../../enum/proposal-source";
import { Procedure } from "../../../models/procedure";
import { ProcedureAction } from "../../../models/procedure-action";
import { ProposalsView } from "../../../../../shared/models/proposals-view";
import { GridSupplier } from "../../../../../shared/components/grid/grid-supplier";
import { Proposal } from "../../../../../shared/components/grid/proposal";
import { GridRowComponent } from "../../../../../shared/components/grid/grid-row/grid-row.component";
import { ScrollPositionService } from "../../../../../shared/services/scroll-position.service";
import { CommonProposal, CommonProposalByPosition, CommonProposalItem } from "../../../../common/models/common-proposal";
import { ProposalSourceLabels } from "../../../../common/dictionaries/proposal-source-labels";
import { ProposalHelperService } from "../../../../../shared/components/grid/proposal-helper.service";

@Component({
  selector: 'app-common-proposal-view',
  templateUrl: './proposal-view.component.html',
  styleUrls: ['proposal-view.component.scss'],
  animations: [trigger('sidebarHide', [
    transition(':leave', animate('300ms ease', style({ 'max-width': '0', 'margin-left': '0' }))),
  ])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalViewComponent implements OnDestroy, AfterViewInit, OnChanges {
  @ViewChildren(GridRowComponent) gridRowsComponent: QueryList<GridRowComponent>;
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  @ViewChildren('viewPopover') viewPopover: QueryList<UxgPopoverComponent>;
  @ViewChildren('selectPopover') selectPopoverRef: QueryList<UxgPopoverComponent>;
  @Input() proposals: CommonProposal[];
  @Input() proposalsByPositions: CommonProposalByPosition[];
  @Input() availablePositions: RequestPosition[];
  @Input() procedureCreationPositions: RequestPosition[];
  @Input() positions: RequestPosition[];
  @Input() procedures: Procedure[];
  @Input() status: StateStatus;
  @Input() request: Request;
  @Input() requestStatus: StateStatus;
  @Input() groupId: Uuid;
  @Input() source: ProposalSource;
  @Input() contragentsWithTp: ContragentShortInfo[];
  @Input() canRollback: (position: RequestPosition, rollbackDuration: number) => boolean;

  @Output() downloadTemplate = new EventEmitter();
  @Output() uploadTemplate = new EventEmitter<File[]>();
  @Output() downloadAnalyticalReport = new EventEmitter();
  @Output() publishPositions = new EventEmitter<CommonProposalByPosition[]>();
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
  showForm: boolean;
  stickedPosition: boolean;
  files: File[] = [];
  addProposalPositionPayload: {
    proposal: CommonProposal,
    proposalPosition: CommonProposalItem,
    position: RequestPosition,
    supplier?: ContragentShortInfo
  };
  form: FormGroup;
  invalidUploadTemplate = false;
  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  prolongModalPayload: Procedure;
  proposalModalData: CommonProposalByPosition;
  rollbackDuration = 10 * 60;
  editingProposal: CommonProposal;

  readonly destroy$ = new Subject();
  readonly getCurrencySymbol = getCurrencySymbol;
  readonly sourceLabels = ProposalSourceLabels;

  hasWinnerFunction = (proposal): boolean => proposal.items?.some(item => item.status === "APPROVED");

  get selectedPositions(): CommonProposalByPosition[] {
    return (this.form.get('positions') as FormArray).controls
      ?.filter(({ value }) => value.checked)
      .map(({ value }) => (value.item));
  }

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public featureService: FeatureService,
    public scrollPositionService: ScrollPositionService,
    public helper: ProposalHelperService
  ) {}

  ngOnChanges({ proposalsByPositions }: SimpleChanges) {
    if (this.proposalsByPositions && proposalsByPositions) {
      this.form = this.fb.group({
        checked: false,
        positions: this.fb.array(this.proposalsByPositions.map(item => {
          const form = this.fb.group({ checked: false, item });
          if (
            this.isReviewed(item) ||
            this.isOnReview(item) ||
            this.isInQueue(item) ||
            this.isPositionOnApprove(item) ||
            (!this.isPositionOnProposalsPreparation(item) && this.source === 'COMMERCIAL_PROPOSAL') ||
            item.items.length === 0
          ) {
            form.get("checked").disable();
          }
          return form;
        }))
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
  }

  switchView(view: ProposalsView) {
    this.view = view;
    this.viewChange.emit(view);
    this.viewPopover?.first.hide();
  }

  getContragents(proposals: CommonProposal[]): ContragentShortInfo[] {
    return proposals.map(proposal => proposal.supplier);
  }

  isReviewed = ({ items }: CommonProposalByPosition) => items.some((p) => ['APPROVED', 'REJECTED'].includes(p.status)) && items.length > 0;
  isOnReview = ({ items }: CommonProposalByPosition) => items.every(p => ['SENT_TO_REVIEW'].includes(p.status)) && items.length > 0;
  isInQueue = ({ items }: CommonProposalByPosition) => items.some(p => p.inQueue === true) && items.length > 0;
  isSentToEdit = ({ items }: CommonProposalByPosition) => items.some(p => ['SENT_TO_EDIT'].includes(p.status)) && items.length > 0;
  isDraft = ({ items }: CommonProposalByPosition): boolean => items.every(p => ['NEW'].includes(p.status));
  isPositionOnProposalsPreparation = ({ position }: CommonProposalByPosition): boolean => ['PROPOSALS_PREPARATION'].includes(position.status);
  isPositionOnApprove = ({ position }: CommonProposalByPosition): boolean => position.status === 'ON_CUSTOMER_APPROVAL';
  isAddContragentDisabled = () => this.proposalsByPositions.length > 0 && (this.proposalsByPositions.every(
    item => (this.isOnReview(item) || this.isReviewed(item)) && item.items.length > 0
  ) || this.proposalsByPositions.some((item) => [
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
        .forEach(hasAnalogs => suppliers.push({ ...proposal.supplier, hasAnalogs }));
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
  trackByProposalByPositionId = (i, { position }: CommonProposalByPosition) => position.id;
  converProposalPosition = ({ items }: CommonProposalByPosition) => items.map(p => new Proposal(p));
  getProposalItemBySupplier = (positionProposals: CommonProposalByPosition) => ({ id, hasAnalogs }: GridSupplier) => {
    const proposal = positionProposals.items.find((p) => p.supplierContragent.id === id && p.isAnalog === hasAnalogs);
    return proposal ? new Proposal<CommonProposalItem>(proposal) : null;
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
}
