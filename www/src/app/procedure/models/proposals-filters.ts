import { Uuid } from 'src/app/cart/models/uuid';
import { User } from 'src/app/user/models/user';
import { TechnicalCommercialProposalPositionStatus } from './../../request/common/enum/technical-commercial-proposal-position-status';
export interface IProposalsFilters {
  contragentUsers?: Uuid[];
  responsibleUsers?: Uuid[];
  requestsNumbers?: string[];
  requestPositionName?: string;
  offersApproveGroupName?: string;
  offersApproveGroupId?: string;
  statuses?: TechnicalCommercialProposalPositionStatus[];
  onlyWithoutOffersApproveGroups?: boolean;
}

export interface IAvailableProposalsFilters {
  contragentUsers: User[];
  responsibleUsers: User[];
  requestsNumbers: number[];
  statuses: TechnicalCommercialProposalPositionStatus[];
}
