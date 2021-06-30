import { PositionStatus } from "../enum/position-status";

export const PositionStatusGroups = {
  DRAFT: [
    PositionStatus.DRAFT,
    PositionStatus.PROOF_OF_NEED,
    PositionStatus.ON_CUSTOMER_APPROVAL
  ],
  NEW: [
    PositionStatus.NEW
  ],
  TECHNICAL_PROPOSALS: [
    PositionStatus.TECHNICAL_PROPOSALS_PREPARATION,
    PositionStatus.TECHNICAL_PROPOSALS_AGREEMENT
  ],
  TECHNICAL_COMMERCIAL_PROPOSALS: [
    PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION,
    PositionStatus.TCP_WINNER_SELECTED,
    PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT,
  ],
  PROPOSALS: [
    PositionStatus.PROPOSALS_PREPARATION,
    PositionStatus.WINNER_SELECTED,
    PositionStatus.RESULTS_AGREEMENT,
  ],
  CONTRACT: [
    PositionStatus.CONTRACTED,
    PositionStatus.CONTRACT_SIGNING,
    PositionStatus.CONTRACT_AGREEMENT
  ],
  RKD: [
    PositionStatus.RKD_AGREEMENT,
    PositionStatus.MANUFACTURING
  ],
  DELIVERY: [
    PositionStatus.DELIVERY,
    PositionStatus.DELIVERED
  ],
  COMPLETED: [
    PositionStatus.PAID,
    PositionStatus.COMPLETED
  ],
  CANCELED: [
    PositionStatus.CANCELED
  ],
  NOT_RELEVANT: [
    PositionStatus.NOT_RELEVANT
  ],
};
