import {PositionCancelReason} from "../enum/position-cancel-reason";

export const PositionCancelReasonLabels: Record<PositionCancelReason, string> = {
  [PositionCancelReason.NO_PROPOSALS] : "Не получено ТП/КП поставщиков",
  [PositionCancelReason.COMMERCIAL_PROPOSALS_REJECTED] : "Заказчика не устроило предложенное КП",
  [PositionCancelReason.TECHNICAL_PROPOSALS_REJECTED] : "Заказчика не устроило предложенное ТП",
  [PositionCancelReason.CUSTOMER_IGNORE] : "Отсутствует обратная связь от заказчика",
  [PositionCancelReason.OTHER] : "Иное..."
};
