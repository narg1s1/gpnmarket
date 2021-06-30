import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { Store } from '@ngxs/store';
import { ProcedureService } from './../../../../request/back-office/services/procedure.service';
import { GridSupplier } from './../grid-supplier';
import { OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Component, EventEmitter, HostBinding, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from "@angular/forms";
import { getCurrencySymbol } from "@angular/common";
import { Position } from "../position";
import { Proposal } from "../proposal";
import { ProposalHelperService } from "../proposal-helper.service";
import { ContragentShortInfo } from "../../../../contragent/models/contragent-short-info";
import { FeatureService } from "../../../../core/services/feature.service";
import { UserInfoService } from "../../../../user/service/user-info.service";

@Component({
  selector: 'app-grid-cell',
  templateUrl: './grid-cell.component.html',
  styleUrls: ['./grid-cell.component.scss'],
  providers: [ProcedureService]
})
export class GridCellComponent extends OnDestroyDirective implements OnInit, OnChanges, OnDestroy {
  @Input() position: Position;
  @Input() proposal: Proposal;
  @Input() selectedProposal: FormControl;
  @Input() editable: boolean;
  @Input() supplier: ContragentShortInfo;
  @Input() tradingScheme: 'TRADE' | 'AGENT';
  @Input() approveType: 'REFERENCE' | "MATRIX";
  @Input() proposalGroupId: string;
  @Input() disableSelectTCPs: boolean;
  @Input() selectedSuppliers: GridSupplier[];
  @Input() activeTab: 'reviewedTab' | 'sentToReviewTab' | 'sentToEdit';
  @Input() proposalStatusCode: string;

  @Output() selectPositionTCP = new EventEmitter<Proposal>();
  @Output() selectProposal = new EventEmitter<Proposal>();
  @Output() create = new EventEmitter();
  @Output() edit = new EventEmitter<Proposal>();
  @Output() show = new EventEmitter<Proposal>();

  @HostBinding('class.grid-cell')
  @HostBinding('class.app-col') classes = true;
  @HostBinding('class.empty') get isEmpty() { return !this.proposal; }
  getCurrencySymbol = getCurrencySymbol;

  public selectedAnalog = new FormControl(null);

  ngOnInit() {
    this.selectedAnalog?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.proposal)
      ).subscribe(value => {
        this.selectPositionTCP.emit(this.proposal);
      });

    this.selectedProposal?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.proposal)
      ).subscribe(value => {
        this.selectPositionTCP.emit(value);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    // При смене торговой схемы сбрасываем выбранные предложения и аналоги
    if (changes.tradingScheme?.currentValue !== changes.tradingScheme?.previousValue) {
      this.selectedProposal?.setValue(null, {emitEvent: false});
      this.selectedAnalog?.setValue(null, {emitEvent: false});
    }
    // выделяем предложения при выборе поставщика
    if (changes.selectedSuppliers?.currentValue && this.proposal?.supplierContragent) {
      this.selectedProposal?.setValue(null, {emitEvent: false});
      this.selectedAnalog?.setValue(null, {emitEvent: false});

      if (changes.selectedSuppliers.currentValue[0]?.id === this.proposal?.supplierContragent.id && !this.proposal?.isAnalog) {
        setTimeout(() => {
          this.selectedProposal?.setValue(this.proposal, {emitEvent: false});
          this.selectProposal.emit(this.proposal);
          this.cd.detectChanges();
        });
      }
    }

    if (!changes.selectedSuppliers?.currentValue && !this.proposal?.supplierContragent) {
      setTimeout(() => {
        this.selectedProposal?.enable({emitEvent: false});
        this.selectedAnalog?.enable({emitEvent: false});
      });
    }

    // дизейблим предложения при выборе позиции
    if (changes.disableSelectTCPs?.currentValue !== changes.disableSelectTCPs?.previousValue) {
      if (changes.disableSelectTCPs?.currentValue) {
        this.selectedProposal.setValue(null, {emitEvent: false});
        this.selectedAnalog.setValue(null, {emitEvent: false});
        this.selectedProposal.disable({emitEvent: false});
        this.selectedAnalog.disable({emitEvent: false});
      } else {
        this.selectedProposal.enable({emitEvent: false});
        this.selectedAnalog.enable({emitEvent: false});
      }
    }
  }

  constructor(public helper: ProposalHelperService,
    public featureService: FeatureService,
    public user: UserInfoService,
    private cd: ChangeDetectorRef,
    private procedureService: ProcedureService,
    private store: Store) {
    super();
  }

  addToFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    this.procedureService.toggleTCPisFavorite(this.proposal.id, this.proposal.id, !this.proposal.isFavorite)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.proposal.isFavorite = !this.proposal.isFavorite;
        this.store.dispatch(new ToastActions.Success(this.proposal.isFavorite ? 'Предложение добавлено в избранное' : 'Предложение удалено из избранного'));
      }, () => {
        this.store.dispatch(new ToastActions.Error('Не удалось добавить предложение в избранное'));
      });
  }

  getIncreaseValue(proposal: Proposal): number {
    let increase = 0;
    try {
      increase = parseFloat(proposal?.increase?.value);
    } catch (error) {
      throw new Error(error);
    }
    return increase;
  }
}
