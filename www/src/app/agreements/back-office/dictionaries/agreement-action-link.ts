import { AgreementAction } from "../enum/agreement-action";

export const AgreementActionLink: Partial<Record<AgreementAction, string>> = {
  [AgreementAction.PROVIDE_TP] : "technical-proposals",
  [AgreementAction.PROVIDE_CP] : "commercial-proposals",
  [AgreementAction.PROVIDE_TCP] : "technical-commercial-proposals",
  [AgreementAction.CORRECT_TP] : "technical-proposals",
  [AgreementAction.PROCESS_WINNER_SELECTED_CP] : "commercial-proposals",
  [AgreementAction.PROCESS_WINNER_SELECTED_TCP] : "technical-commercial-proposals",
  [AgreementAction.SEND_CONTRACT_AGREEMENT] : "contracts",
  [AgreementAction.SIGN_CONTRACT] : "contracts",
  [AgreementAction.CORRECT_CONTRACT] : "contracts",
  [AgreementAction.MANUFACTURING_CONTROL_WITH_RKD] : "design-documentation",
  [AgreementAction.REVIEW_TP]: "technical-proposals",
  [AgreementAction.RESULTS_AGREEMENT_CP]: "commercial-proposals",
  [AgreementAction.RESULTS_AGREEMENT_TCP]: "technical-commercial-proposals",
  [AgreementAction.REVIEW_CONTRACT]: "contracts",
  [AgreementAction.REVIEW_RKD]: "design-documentation",
  [AgreementAction.SPECIFY_RKD]: "design-documentation",
  [AgreementAction.INIT_AGREEMENT_RKD]: "design-documentation",
  [AgreementAction.SEND_AGREEMENT_RKD]: "design-documentation",
  [AgreementAction.CORRECT_RKD]: "design-documentation",
};
