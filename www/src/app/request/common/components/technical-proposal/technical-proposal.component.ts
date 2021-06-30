import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TechnicalProposal } from "../../models/technical-proposal";
import { TechnicalProposalsStatusesLabels } from "../../dictionaries/technical-proposals-statuses-labels";
import { TechnicalProposalPositionStatus } from "../../enum/technical-proposal-position-status";
import { TechnicalProposalsStatus } from "../../enum/technical-proposals-status";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { FeatureService } from "../../../../core/services/feature.service";
import moment from "moment";
import { TechnicalProposalsService } from "../../../back-office/services/technical-proposals.service";
import { Request } from "../../models/request";

@Component({
  selector: 'app-request-technical-proposal',
  templateUrl: './technical-proposal.component.html',
  styleUrls: ['./technical-proposal.component.scss']
})
export class RequestTechnicalProposalComponent implements OnInit {

  @Input() request: Request;
  @Input() technicalProposal: TechnicalProposal;
  @Output() edit = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<TechnicalProposal>();
  @Output() cancelTechnicalProposal = new EventEmitter<TechnicalProposal>();
  @Output() sendTechnicalProposalToAgreement = new EventEmitter<TechnicalProposal>();

  lastSentToEditComment: string;
  lastSentToEditCommentDate: string;

  lastRejectComment: string;
  lastRejectCommentDate: string;

  isLoading: boolean;
  isFolded: boolean;

  public durationCancelPublish = 10 * 60;

  constructor(
    public featureService: FeatureService,
    public userInfoService: UserInfoService,
    private technicalProposalsService: TechnicalProposalsService,
  ) {
  }

  private editableStatuses = [
    TechnicalProposalPositionStatus.NEW,
    TechnicalProposalPositionStatus.EDITED,
    TechnicalProposalPositionStatus.SENT_TO_EDIT,
    TechnicalProposalsStatus.NEW,
    TechnicalProposalsStatus.SENT_TO_EDIT,
  ];

  ngOnInit() {
    this.lastSentToEditComment = this.getLastSentToEditComment();
    this.lastSentToEditCommentDate = this.getLastSentToEditCommentDate();

    this.lastRejectComment = this.getLastRejectComment();
    this.lastRejectCommentDate = this.getLastRejectCommentDate();
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

  get editable(): boolean {
    const {status, positions} = this.technicalProposal;
    return this.editableStatuses.includes(status) && positions.some(({ status: s }) => this.editableStatuses.indexOf(s) >= 0);
  }

  availableCancelPublishTechnicalProposal(technicalProposal: TechnicalProposal) {
    return technicalProposal.status === TechnicalProposalsStatus.SENT_TO_REVIEW
      && this.getStatusChangeDuration(technicalProposal) < this.durationCancelPublish;
  }

  /**
   * Возвращает время в секундах, которое прошло с момента смены статуса ТП
   * @param technicalProposal
   */
  protected getStatusChangeDuration(technicalProposal: TechnicalProposal): number {
    return moment().diff(moment(technicalProposal.statusChangedDate), 'seconds');
  }

  onCancelPublishTechnicalProposal(technicalProposal: TechnicalProposal) {
    this.cancelTechnicalProposal.emit(technicalProposal);
  }

  sendToAgreement(technicalProposal: TechnicalProposal): void {
    this.isLoading = true;

    const subscription = this.technicalProposalsService.sendForApproval(this.request.id, technicalProposal).subscribe(
      () => {
        this.update.emit(technicalProposal);
        this.isLoading = false;
        subscription.unsubscribe();
      }
    );
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
