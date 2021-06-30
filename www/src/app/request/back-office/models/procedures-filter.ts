import { Uuid } from "../../../cart/models/uuid";

export class ProceduresFilter {
  procedureId: string;
  procedureTitle: string;
  okpd2: null;
  customersIds: Uuid[];
  purchaseForm: 'any' | 'opened' | 'closed';
  statuses: string[];
  isRetrade: boolean;
  datePublishedFrom: string;
  datePublishedTo: string;
  dateEndRegistrationFrom: string;
  dateEndRegistrationTo: string;
  dateSummingUpFrom: string;
  dateSummingUpTo: string;
}

export class ProceduresRequestsFilter {
  procedureTitle?: string;
  notAnswered?: boolean;
  explanationType?: string;
}
