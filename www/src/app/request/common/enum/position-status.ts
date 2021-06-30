export enum PositionStatus {
  DRAFT = 'DRAFT',                                 // Черновик
  ON_CUSTOMER_APPROVAL = 'ON_CUSTOMER_APPROVAL',   // На согласовании заказчика
  PROOF_OF_NEED = 'PROOF_OF_NEED',                 // Необходимо подтверждение
  NEW = 'NEW',                                     // Новая
  NOT_RELEVANT = 'NOT_RELEVANT',                   // Неактуально
  TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION = 'TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION', // Подготовка ТКП
  TECHNICAL_PROPOSALS_PREPARATION = 'TECHNICAL_PROPOSALS_PREPARATION', // Подготовка ТП
  TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT = 'TECHNICAL_COMMERCIAL_PROPOSALS_AGREEMENT', // Согласование ТКП
  TECHNICAL_PROPOSALS_AGREEMENT = 'TECHNICAL_PROPOSALS_AGREEMENT',     // Согласование ТП
  PROPOSALS_PREPARATION = 'PROPOSALS_PREPARATION', // Подготовка КП
  RESULTS_AGREEMENT = 'RESULTS_AGREEMENT',         // Согласование КП
  WINNER_SELECTED = 'WINNER_SELECTED',             // Выбран победитель КП
  TCP_WINNER_SELECTED  = 'TCP_WINNER_SELECTED',    // Выбран победитель ТКП
  CONTRACT_AGREEMENT = 'CONTRACT_AGREEMENT',       // Согласование договора
  CONTRACT_SIGNING = 'CONTRACT_SIGNING',           // Подписание договора
  CONTRACTED = 'CONTRACTED',                       // Законтрактовано
  RKD_AGREEMENT = 'RKD_AGREEMENT',                 // Согласование РКД
  RKD_APPROVED = 'RKD_APPROVED',                   // РКД согласована
  MANUFACTURING = 'MANUFACTURING',                 // Изготовление
  DELIVERY = 'DELIVERY',                           // Доставка
  DELIVERED = 'DELIVERED',                         // Поставлено
  RELATED_SERVICES_EXECUTION = 'RELATED_SERVICES_EXECUTION', // Оказание сопутствующих услуг
  PAID = 'PAID',                                   // Оплачено
  WARRANTY = 'WARRANTY',                           // Гарантийные обязательства
  COMPLETED = 'COMPLETED',                         // Завершено
  CANCELED = 'CANCELED'                             // Отменено
}
