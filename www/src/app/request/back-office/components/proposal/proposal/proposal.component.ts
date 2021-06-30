import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { Request } from "../../../../common/models/request";
import { Uuid } from "../../../../../cart/models/uuid";
import { ProposalSource } from "../../../enum/proposal-source";
import { CommonProposal, CommonProposalItem } from "../../../../common/models/common-proposal";
import { RequestPosition } from "../../../../common/models/request-position";
import { TechnicalCommercialProposalHelperService } from "../../../../common/services/technical-commercial-proposal-helper.service";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";
import { FeatureService } from "../../../../../core/services/feature.service";

@Component({
  selector: 'app-common-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalComponent {
  @Input() request: Request;
  @Input() groupId: Uuid;
  @Input() proposal: CommonProposal;
  @Input() positions: RequestPosition[];
  @Input() availablePositions: RequestPosition[];
  @Input() source: ProposalSource;
  @Input() selectedContragents: ContragentShortInfo[];
  @Output() edit = new EventEmitter<{ proposal: Partial<CommonProposal> & { id: Uuid }, items: CommonProposalItem[] }>();

  state: "view" | "edit" = "view";
  folded = false;

  readonly getCurrencySymbol = getCurrencySymbol;
  readonly getPosition = (item: CommonProposalItem) => this.positions?.find(({ id }) => id === item?.requestPositionId);

  get publishedCount() {
    return this.proposal?.items.filter(({status}) => status !== 'NEW').length;
  }

  get editable() {
    return this.proposal?.items.every(({status}) => ['NEW', 'SENT_TO_EDIT'].includes(status));
  }

  get isReviewed() {
    return this.proposal?.items.length > 0 && this.proposal?.items.every(({status}) => ['APPROVED'].includes(status));
  }

  get isPartiallyReviewed() {
    return this.proposal?.items.length > 0 && this.proposal?.items.some(({status}) => ['APPROVED'].includes(status));
  }

  get isSentToEdit() {
    return this.proposal?.items.length > 0 && this.proposal?.items.every(({status}) => ['SENT_TO_EDIT'].includes(status));
  }

  get isInQueue(): boolean {
    return this.proposal.items.some(p => p.inQueue === true) && this.proposal.items.length > 0;
  }

  constructor(public helper: TechnicalCommercialProposalHelperService, public featureService: FeatureService) {
  }
}
