import { Component, Input, OnInit } from '@angular/core';
import { TechnicalProposal } from "../../../../../common/models/technical-proposal";
import { TechnicalProposalsStatusesLabels } from "../../../../../common/dictionaries/technical-proposals-statuses-labels";
import { TechnicalProposalPositionStatus } from "../../../../../common/enum/technical-proposal-position-status";
import { UserInfoService } from "../../../../../../user/service/user-info.service";
import { FeatureService } from "../../../../../../core/services/feature.service";
import { TechnicalProposalsService } from "../../../../../back-office/services/technical-proposals.service";
import { Request } from "../../../../../common/models/request";
import { TechnicalProposalPosition } from "../../../../../common/models/technical-proposal-position";
import { TechnicalProposals } from "../../../../actions/technical-proposal.actions";
import { Actions, ofActionCompleted, Select, Store } from "@ngxs/store";
import { takeUntil } from "rxjs/operators";
import { ToastActions } from "../../../../../../shared/actions/toast.actions";
import { Observable, Subject } from "rxjs";
import { PluralizePipe } from "../../../../../../shared/pipes/pluralize-pipe";
import Approve = TechnicalProposals.Approve;
import Reject = TechnicalProposals.Reject;
import SendToEdit = TechnicalProposals.SendToEdit;
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { TechnicalProposalState } from "../../../../states/technical-proposal.state";
import { StateStatus } from "../../../../../common/models/state-status";

@Component({
  selector: 'app-request-customer-technical-proposal',
  templateUrl: './technical-proposal.component.html',
  styleUrls: ['./technical-proposal.component.scss'],
  providers: [PluralizePipe]
})
export class RequestTechnicalProposalComponent implements OnInit {

  @Input() request: Request;
  @Input() technicalProposal: TechnicalProposal;
  @Input() technicalProposalIndex: number;
  @Input() currentList: string;

  isLoading: boolean;
  isFolded: boolean;
  actionType: string;

  lastSentToEditComment: string;
  lastSentToEditCommentDate: string;

  lastRejectComment: string;
  lastRejectCommentDate: string;

  @Select(TechnicalProposalState.status)
  readonly stateStatus$: Observable<StateStatus>;

  readonly destroy$ = new Subject();
  selectedTechnicalProposalsPositions: TechnicalProposalPosition[] = [];

  form = new FormGroup({
    comment: new FormControl(this.actionType === 'reject' ? this.lastRejectComment : this.lastSentToEditComment, Validators.maxLength(300))
  });

  constructor(
    public featureService: FeatureService,
    public userInfoService: UserInfoService,
    private technicalProposalsService: TechnicalProposalsService,
    private actions: Actions,
    private store: Store,
    private pluralize: PluralizePipe,
  ) {
  }

  ngOnInit() {
    this.lastSentToEditComment = this.getLastSentToEditComment();
    this.lastSentToEditCommentDate = this.getLastSentToEditCommentDate();

    this.lastRejectComment = this.getLastRejectComment();
    this.lastRejectCommentDate = this.getLastRejectCommentDate();

    this.actions.pipe(
      ofActionCompleted(Approve, Reject, SendToEdit),
      takeUntil(this.destroy$)
    ).subscribe(({result, action}) => {
      const e = result.error as any;
      const length = action?.proposalPositions.length ?? 1;
      const text = (action instanceof Reject ? "$0" : (action instanceof Approve ? "$1" : "$2"))
        .replace(/\$(\d)/g, (all, i) => [
        this.pluralize.transform(length, "позиция отклонена", "позиции отклонены", "позиций отклонено"),
        this.pluralize.transform(length, "позиция согласована", "позиции согласованы", "позиций согласовано"),
        this.pluralize.transform(length, "позиция отправлена на доработку", "позиции отправлены на доработку", "позиций отправлено на доработку"),
      ][i] || all);

      this.store.dispatch(e ?
        new ToastActions.Error(e && e.error.detail) : new ToastActions.Success(text)
      );

      this.lastSentToEditComment = this.getLastSentToEditComment();
      this.lastSentToEditCommentDate = this.getLastSentToEditCommentDate();

      this.lastRejectComment = this.getLastRejectComment();
      this.lastRejectCommentDate = this.getLastRejectCommentDate();
    });
  }

  tpStatusLabel(technicalProposal: TechnicalProposal): string {
    return TechnicalProposalsStatusesLabels[technicalProposal.status];
  }

  getLabelWithCounters(technicalProposal: TechnicalProposal): string {
    const totalPositionsCount = technicalProposal.positions.length;
    const approvedPositionsCount = technicalProposal.positions.reduce(
      (count, tpPosition) => tpPosition.status === TechnicalProposalPositionStatus.ACCEPTED ? count + 1 : count, 0
    );

    return 'Согласовано ' + approvedPositionsCount + ' из ' + totalPositionsCount;
  }

  approve() {
    this.isLoading = true;

    this.store.dispatch(new Approve(this.request.id, this.technicalProposal.id, this.selectedTechnicalProposalsPositions))
      .pipe(takeUntil(this.destroy$)).subscribe();
  }

  reject() {
    this.isLoading = true;

    this.store.dispatch(new Reject(this.request.id, this.technicalProposal.id, this.selectedTechnicalProposalsPositions, this.form.get('comment').value))
      .pipe(takeUntil(this.destroy$)).subscribe();
  }

  sendToEdit() {
    this.isLoading = true;

    this.store.dispatch(new SendToEdit(this.request.id, this.technicalProposal.id, this.selectedTechnicalProposalsPositions, this.form.get('comment').value))
      .pipe(takeUntil(this.destroy$)).subscribe();
  }

  submit() {
    switch (this.actionType) {
      case 'reject': this.reject(); break;
      case 'sendToEdit': this.sendToEdit(); break;
    }
  }

  onSelectPosition(i, technicalProposalPosition: TechnicalProposalPosition): void {
    const index = this.selectedTechnicalProposalsPositions.indexOf(technicalProposalPosition);

    if (index === -1) {
      this.selectedTechnicalProposalsPositions.push(technicalProposalPosition);
    } else {
      this.selectedTechnicalProposalsPositions.splice(index, 1);
    }
  }

  onSelectAllPositions(checked, i): void {
    if (checked === true) {
      this.technicalProposal.positions.forEach(technicalProposalPosition => {
        const index = this.selectedTechnicalProposalsPositions.indexOf(technicalProposalPosition);

        if (!this.isProposalPositionReviewed(technicalProposalPosition) && index === -1) {
          this.selectedTechnicalProposalsPositions.push(technicalProposalPosition);
        }
      });
    } else {
      this.selectedTechnicalProposalsPositions = [];
    }
  }

  areAllPositionsChecked(technicalProposalPositions: TechnicalProposalPosition[]): boolean {
    return !technicalProposalPositions.some(
      technicalProposalPosition => technicalProposalPosition.checked !== true
    );
  }

  hasSelectablePositions(technicalProposalPositions: TechnicalProposalPosition[]): boolean {
    return technicalProposalPositions.some(technicalProposalPosition =>
      this.isPositionSelectorAvailable(technicalProposalPosition));
  }

  hasSelectedPositions(index): boolean {
    return this.technicalProposal.positions.some(technicalProposalPosition => {
      return this.isTechnicalProposalPositionChecked(index, technicalProposalPosition) &&
             this.isPositionSelectorAvailable(technicalProposalPosition);
    });
  }

  isPositionSelectorAvailable(tpPosition: TechnicalProposalPosition): boolean {
    const selectorAvailableStatues = [
      TechnicalProposalPositionStatus.REVIEW
    ];
    return selectorAvailableStatues.indexOf(tpPosition.status) >= 0;
  }

  isTechnicalProposalPositionChecked(i, tpPosition: TechnicalProposalPosition): boolean {
    const index = this.selectedTechnicalProposalsPositions.indexOf(tpPosition);

    return index !== -1;
  }

  isProposalPositionReviewed(position): boolean {
    return [
      TechnicalProposalPositionStatus.ACCEPTED,
      TechnicalProposalPositionStatus.DECLINED,
      TechnicalProposalPositionStatus.SENT_TO_EDIT
    ].indexOf(position.status) > -1;
  }

  getLastRejectComment(): string {
    return this.technicalProposal.positions
      .filter(position => position.status === 'DECLINED' && position.history.data.statusComment !== null)
      .sort((a, b) => (a.history.createdDate > b.history.createdDate) ? 1 : -1)
      .pop()?.history.data.statusComment.comment;
  }
  getLastRejectCommentDate(): string {
    return this.technicalProposal.positions
      .filter(position => position.status === 'DECLINED' && position.history.data.statusComment !== null)
      .sort((a, b) => (a.history.createdDate > b.history.createdDate) ? 1 : -1)
      .pop()?.history.createdDate;
  }

  getLastSentToEditComment(): string {
    return this.technicalProposal.positions
      .filter(position => position.status === 'SENT_TO_EDIT' && position.history.data.statusComment !== null)
      .sort((a, b) => (a.history.createdDate > b.history.createdDate) ? 1 : -1)
      .pop()?.history.data.statusComment.comment;
  }
  getLastSentToEditCommentDate(): string {
    return this.technicalProposal.positions
      .filter(position => position.status === 'SENT_TO_EDIT' && position.history.data.statusComment !== null)
      .sort((a, b) => (a.history.createdDate > b.history.createdDate) ? 1 : -1)
      .pop()?.history.createdDate;
  }
}
