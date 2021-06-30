import { AgreementAction } from "../enum/agreement-action";

export const AgreementActionFilters: {type: AgreementAction[], label: string}[] = [
{ type: [AgreementAction.PROCESS_REQUEST], label: "Обработать заявку"},
  { type: [AgreementAction.WORK_ON_REQUEST], label: "Принять в работу"},
  { type: [AgreementAction.PROVIDE_TP], label: "Предоставить ТП"},
  { type: [AgreementAction.PROVIDE_CP], label: "Предоставить КП"},
  { type: [AgreementAction.PROVIDE_TCP], label: "Предоставить ТКП"},
  { type: [AgreementAction.CORRECT_TP], label: "Скорректировать ТП"},
  { type: [AgreementAction.PROCESS_WINNER_SELECTED_CP, AgreementAction.PROCESS_WINNER_SELECTED_TCP], label: "Обработать результаты выбора"},
  { type: [AgreementAction.SEND_CONTRACT_AGREEMENT], label: "Направить проект договора на согласование"},
  { type: [AgreementAction.SIGN_CONTRACT], label: "Подписать договор"},
  { type: [AgreementAction.CORRECT_CONTRACT], label: "Скорректировать проект договора"},
  { type: [AgreementAction.INIT_AGREEMENT_RKD], label: "Инициировать согласование РКД"},
  { type: [AgreementAction.SPECIFY_RKD], label: "Указать состав РКД"},
  { type: [AgreementAction.SEND_AGREEMENT_RKD], label: "Направить РКД на согласование"},
  { type: [AgreementAction.CORRECT_RKD], label: "Скорректировать РКД"},
  { type: [AgreementAction.MANUFACTURING_CONTROL, AgreementAction.MANUFACTURING_CONTROL_WITH_RKD], label: "Контроль начала изготовления"},
  { type: [AgreementAction.CONTROL_MANUFACTURING_AND_SHIPMENT], label: "Контроль изготовления и отгрузки"},
  { type: [AgreementAction.CONTROL_DELIVERY], label: "Контроль доставки"},
  { type: [AgreementAction.COMPLETED], label: "Завершение работы"},
  { type: [AgreementAction.COMPLETE_REQUEST, AgreementAction.REQUEST_AGREEMENT,
    AgreementAction.REVIEW_TP, AgreementAction.RESULTS_AGREEMENT_CP,
    AgreementAction.RESULTS_AGREEMENT_TCP, AgreementAction.REVIEW_CONTRACT, AgreementAction.REVIEW_RKD], label: "Задачи на согласовании заказчика"}
];
