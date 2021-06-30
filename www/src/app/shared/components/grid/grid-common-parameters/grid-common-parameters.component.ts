import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ProposalHelperService } from "../proposal-helper.service";
import { getCurrencySymbol } from "@angular/common";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { ProposalWithCommonInfo } from "../../../../request/common/models/proposal-with-common-info";
import { CommonProposal, CommonProposalItem } from "../../../../request/common/models/common-proposal";
import { RequestPosition } from "../../../../request/common/models/request-position";
import { Uuid } from "../../../../cart/models/uuid";
import { FeatureService } from "../../../../core/services/feature.service";
import { Proposal } from '../proposal';

@Component({
  selector: 'app-grid-common-parameters',
  templateUrl: './grid-common-parameters.component.html',
  styleUrls: ['./grid-common-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridCommonParametersComponent {
  @HostBinding('class.app-row') appRow = true;
  @HostBinding('class.app-flex-column') appFlexColumn = true;
  @HostBinding('class.has-analogs')
  @Input() hasAnalogs = false;
  @Input() hasWinnerFn: (proposal) => boolean;
  @Input() positions: RequestPosition[];
  @Input() proposal: CommonProposal;
  @Output() close = new EventEmitter();
  @Output() openEditModal = new EventEmitter<ProposalWithCommonInfo>();
  @Output() selectAll = new EventEmitter<ProposalWithCommonInfo>();
  @Input() showDocs: boolean;
  getCurrencySymbol = getCurrencySymbol;

  constructor(
    public helper: ProposalHelperService,
    public userInfoService: UserInfoService,
    public featureService: FeatureService,
  ) { }

  edit(proposal: ProposalWithCommonInfo) {
    this.close.emit();
    this.openEditModal.emit(proposal);
  }

  getPosition(id: Uuid) {
    return this.positions.find(p => p.id === id);
  }

  canEditCommonParams() {
    return (!this.hasWinnerFn || !this.hasWinnerFn(this.proposal)) &&
      !this.positions.every((position: RequestPosition) => [
        'RESULTS_AGREEMENT',
        'CONTRACT_AGREEMENT',
        'TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT',
        'WINNER_SELECTED',
        'TCP_WINNER_SELECTED',
      ].includes(position.status)) &&
      !this.proposal.items.find((proposal: CommonProposalItem) => [
        'SENT_TO_REVIEW',
        'APPROVED',
        'SENT_TO_EDIT'
      ].includes(proposal.status));
  }
}
