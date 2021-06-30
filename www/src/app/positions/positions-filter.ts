import { PositionStatus } from '../request/common/enum/position-status';
import { Uuid } from '../cart/models/uuid';

export interface IPositionsFilters {
  positionOrRequestNameOrNumber?: string;
  responsibleUserIds?: Uuid[];

  onlyWithoutResponsibleUser?: boolean;
  onlyWithStartPrice?: boolean;

  contragentUserIds?: Uuid[];
  positionStatuses?: PositionStatus[];

  procedureId?: number;

  procedureEndRegistrationDateFrom?: string;
  procedureEndRegistrationDateTo?: string;

  procedureDeliveryDateFrom?: string;
  procedureDeliveryDateTo?: string;

  positions?: Uuid[];
  positionsGroupsIds?: Uuid[];
}

export interface IAvailablePositionsFilters {
  responsibleUsers: any[];
  contragentUsers: any[];
  positionStatuses: any[];
  procedureRegistryNumbers: string[];
  requestsNumbers: string[];
}

export interface IPositionsSort {
  orderBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
