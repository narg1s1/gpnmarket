import { UserInfoService } from './../../../../user/service/user-info.service';
import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChildren, AfterContentInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { FormControl, Validators } from "@angular/forms";
import { ContragentShortInfo } from "../../../../contragent/models/contragent-short-info";
import { takeUntil, tap, filter } from "rxjs/operators";
import { Proposal } from "../proposal";
import { ProposalHelperService } from "../proposal-helper.service";
import { Position } from "../position";
import { GridSupplier } from "../grid-supplier";
import { Select } from "@ngxs/store";
import { ProcedureState } from "../../../../procedure/states/procedure.state";
import { OffersApproveGroupModel } from "../../../../procedure/models/offers-approve-group.model";

@Component({
  selector: 'app-grid-row',
  templateUrl: './grid-row.component.html',
  styleUrls: ['./grid-row.component.scss']
})
export class GridRowComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  @ViewChildren('gridRow') gridRows: QueryList<ElementRef>;
  @ContentChild('position', { read: TemplateRef }) positionTpl: TemplateRef<ElementRef>;
  @Select(ProcedureState.offersApproveGroup) offersApproveGroup$: Observable<OffersApproveGroupModel>;

  @Input() suppliers: GridSupplier[];
  @Input() proposals: Proposal[];
  @Input() position: Position;
  @Input() chooseBy$: Subject<"date" | "price">;
  @Input() isReviewed: boolean;
  @Input() isInQueue: boolean;
  @Input() getProposal: (supplier: ContragentShortInfo) => Proposal;
  @Input() getSupplier: (proposal: Proposal) => ContragentShortInfo;
  @Input() editable: boolean;
  @Input() simpleView: boolean;
  @Input() activeTab: 'reviewedTab' | 'sentToReviewTab' | 'sentToEditTab';
  @Input() tradingScheme: 'TRADE' | 'AGENT';
  @Input() approveType: 'REFERENCE' | "MATRIX";
  @Input() proposalGroupId: string;
  @Input() disableSelectTCPs: boolean;
  @Input() selectedSuppliers: GridSupplier[];
  @Input() proposalStatusCode: string;

  @Output() show = new EventEmitter<Proposal>();
  @Output() edit = new EventEmitter<Proposal>();
  @Output() create = new EventEmitter<ContragentShortInfo>();
  @Output() selectPositionTCP = new EventEmitter<Proposal>();
  @Output() selectProposal = new EventEmitter<Proposal>();
  @HostBinding('class.position-row') positionRow = true;
  public selectedProposal = new FormControl(null);
  readonly sendToEditPosition = new FormControl(null, Validators.required);
  readonly rejectedProposal = new FormControl(null, Validators.required);
  readonly destroy$ = new Subject();

  get mainProposals() {
    return this.proposals.filter(proposal => !proposal.isAnalog);
  }

  get analogProposals() {
    return this.proposals.filter(proposal => proposal.isAnalog);
  }

  constructor(private helper: ProposalHelperService, private cdr: ChangeDetectorRef, public user: UserInfoService) {}

  ngOnInit() {
    if (this.chooseBy$ && !this.isInQueue) {
      this.chooseBy$.pipe(
        tap(() => this.selectedProposal.reset()),
        tap(type => this.selectedProposal.setValue(
          this.helper.chooseBy(type, this.position, this.proposals), {emitEvent: true}
        )),
        tap(type => this.selectPositionTCP.emit(this.helper.chooseBy(type, this.position, this.proposals))),
        takeUntil(this.destroy$)
      ).subscribe(() => this.cdr.detectChanges());
    }

    this.selectedProposal.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(proposal => {
        this.sendToEditPosition.reset(null, {emitEvent: false});
        this.rejectedProposal.reset(null, {emitEvent: false});
      });

    this.rejectedProposal.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedProposal.reset(null, {emitEvent: false});
        this.sendToEditPosition.reset(null, {emitEvent: false});
      });

    this.sendToEditPosition.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedProposal.reset(null, {emitEvent: false});
        this.rejectedProposal.reset(null, {emitEvent: false});
      });

    this.offersApproveGroup$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data?.scheme) {
        this.tradingScheme = data?.scheme;
      }
    });

    this.cdr.detectChanges();
  }

  ngAfterContentInit() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  trackByProposalPositionId = (i, supplier: ContragentShortInfo) => this.getProposal(supplier)?.sourceProposal?.id;
  trackBySupplierId = (i, proposal: Proposal) => this.getSupplier(proposal)?.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
