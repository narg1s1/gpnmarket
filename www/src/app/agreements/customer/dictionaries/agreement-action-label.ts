import { AgreementAction } from "../../back-office/enum/agreement-action";


export const AgreementActionFilters: {type: AgreementAction[], label: string}[] = [
  { type: [AgreementAction.COMPLETE_REQUEST], label: "Завершить формирование заявки" },
  { type: [AgreementAction.REQUEST_AGREEMENT], label: "Согласовать заявку" },
  { type: [AgreementAction.REVIEW_TP], label: "Рассмотреть технические предложения" },
  { type: [AgreementAction.RESULTS_AGREEMENT_CP, AgreementAction.RESULTS_AGREEMENT_TCP], label: "Выбор поставщика" },
  { type: [AgreementAction.REVIEW_CONTRACT], label: "Рассмотреть договор" },
  { type: [AgreementAction.REVIEW_RKD], label: "Согласовать РКД" },
  { type: [AgreementAction.REVIEW_COMPLETED_POSITION], label: "Оценить поставку" },
];
