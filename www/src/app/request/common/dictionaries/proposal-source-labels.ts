import { ProposalSource } from "../../back-office/enum/proposal-source";

export const ProposalSourceLabels: Record<ProposalSource, string> = {
  [ProposalSource.TECHNICAL_PROPOSAL]: 'ТП',
  [ProposalSource.COMMERCIAL_PROPOSAL]: 'КП',
  [ProposalSource.TECHNICAL_COMMERCIAL_PROPOSAL]: 'ТКП',
  [ProposalSource.REQUEST]: 'Заявка',
  [ProposalSource.POSITION]: 'Позиция',
};
