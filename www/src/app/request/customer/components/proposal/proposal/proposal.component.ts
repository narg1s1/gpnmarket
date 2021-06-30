import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Uuid } from "../../../../../cart/models/uuid";
import { Select, Store } from "@ngxs/store";
import { getCurrencySymbol } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { UxgModalComponent } from "uxg";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { filter, finalize, takeUntil, tap } from "rxjs/operators";
import { TechnicalCommercialProposalHelperService } from "../../../../common/services/technical-commercial-proposal-helper.service";
import { TechnicalCommercialProposalPosition } from "../../../../common/models/technical-commercial-proposal-position";
import { Position } from "../../../../../shared/components/grid/position";
import { TechnicalCommercialProposalPositionStatus } from "../../../../common/enum/technical-commercial-proposal-position-status";
import { TechnicalCommercialProposalState } from "../../../states/technical-commercial-proposal.state";
import { StateStatus } from "../../../../common/models/state-status";
import {
  CommonProposal,
  CommonProposalByPosition,
  CommonProposalItem
} from "../../../../common/models/common-proposal";
import { RequestPosition } from "../../../../common/models/request-position";
import { ProposalSource } from "../../../../back-office/enum/proposal-source";

@Component({
  selector: "app-common-proposal",
  templateUrl: './proposal.component.html',
  styleUrls: ['proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProposalComponent implements OnChanges, OnDestroy {
  @Select(TechnicalCommercialProposalState.status)
  readonly stateStatus$: Observable<StateStatus>;

  @ViewChild("proposalModal") proposalModal: UxgModalComponent;
  @ViewChildren('gridRow') gridRows: QueryList<ElementRef>;
  @Input() proposalByPos: CommonProposalByPosition;
  @Input() proposal: CommonProposal;
  @Input() technicalCommercialProposalIndex: number;
  @Input() hiddenSupplierNumber: number;
  @Input() requestId: Uuid;
  @Input() chooseBy$: Subject<"date" | "price">;
  @Input() isLoading: boolean;
  @Input() source: ProposalSource;
  @Input() proposals: CommonProposal[];
  @Input() proposalsByPos: CommonProposalByPosition[];
  @Input() positions: RequestPosition[];
  @Output() positionSelected = new EventEmitter();
  @Output() approve = new EventEmitter();
  @Output() sendToEdit = new EventEmitter();
  readonly destroy$ = new Subject();
  position: Position;
  getCurrencySymbol = getCurrencySymbol;
  selectedProposal = new FormControl(null, Validators.required);
  sendToEditPosition = new FormControl(null, Validators.required);
  folded = false;
  form: FormGroup;
  someFilterVar = true;

  get selectedPositions(): CommonProposalItem[] {
    return (this.form.get('positions') as FormArray).controls
      ?.filter(({value}) => value.checked)
      .map(({value}) => (value.position));
  }

  get onReview(): boolean {
    return this.proposal.items.some(({ status }) => ['SENT_TO_REVIEW'].includes(status));
  }

  get reviewed(): boolean {
    return this.proposal.items.every(({ status }) => ['APPROVED', 'REJECTED'].includes(status)) && this.proposal.items.length > 0;
  }

  get isInQueue(): boolean {
    return this.proposal.items.some(p => p.inQueue === true) && this.proposal.items.length > 0;
  }

  constructor(
    public helper: TechnicalCommercialProposalHelperService,
    private store: Store,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnChanges() {
    if (this.chooseBy$) {
      this.chooseBy$.pipe(
        tap(type => {
          (this.form.get('positions') as FormArray).controls?.forEach(c => c.get('checked').setValue(false));
          this.proposalsByPos.forEach(proposalByPos => {
            const item = this.helper.chooseBy(type, proposalByPos.position, proposalByPos.items);
            (this.form.get('positions') as FormArray).controls
            ?.filter((control: FormControl) =>  {
              return item && !control.disabled && !control.value.position.inQueue && control.value.position.id === item.id;
            })
            ?.forEach(c => c.get('checked').setValue(true));
          });
        }),
        takeUntil(this.destroy$)
      ).subscribe(() => this.cd.detectChanges());
    }

    this.form = this.fb.group({
      checked: false,
      positions: this.fb.array(this.proposal.items.map(position => {
        const form = this.fb.group({ checked: false, position });
        if (this.isProposalPositionReviewed(position) || position.inQueue) {
          form.get("checked").disable();
        }
        return form;
      }))
    });

    this.form.valueChanges.pipe(
      filter(() => this.someFilterVar)).subscribe(() => {
        if (this.selectedPositions.length > 0) {
          const selectedPositions = this.selectedPositions;
          const index = this.technicalCommercialProposalIndex;

          const data = { selectedPositions, index };

          this.someFilterVar = false;
          this.positionSelected.emit(data);
          this.someFilterVar = true;
        }
      }
    );
  }

  private dispatchAction(action): void {
    this.isLoading = true;

    this.store.dispatch(action).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  getPosition = (proposal: CommonProposalItem): RequestPosition => {
    return this.positions.find(({ id }) => id === proposal.requestPositionId);
  }

  // Функция сбрасывает чекбоксы во всех ТКП у тех позиций, которые становятся отмечены в другом ТКП
  refreshPositionsSelectedState(i, checkedProposalPositions: CommonProposalItem[]): void {
    if (this.technicalCommercialProposalIndex !== i) {
      const checkedPositionsIds = checkedProposalPositions.map(({requestPositionId}) => requestPositionId);

      (this.form.get('positions') as FormArray).controls?.forEach(
        (control) => {
          const index = checkedPositionsIds.indexOf(control.value.position.requestPositionId);

          if (index !== -1 && control.get('checked').value === true) {
            control.get('checked').setValue(false);
          }
        }
      );

      this.cd.detectChanges();
    }
  }

  isProposalPositionReviewed(position): boolean {
    return [
      TechnicalCommercialProposalPositionStatus.APPROVED,
      TechnicalCommercialProposalPositionStatus.REJECTED,
      TechnicalCommercialProposalPositionStatus.SENT_TO_EDIT
    ].indexOf(position.status) > -1;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
