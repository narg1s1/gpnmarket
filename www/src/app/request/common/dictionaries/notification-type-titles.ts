import { PositionStatus } from "../enum/position-status";

export const NotificationTypeTitles = {
  [PositionStatus.PROPOSALS_PREPARATION]: 'Осуществляется подготовка предложений по позиции',
  [PositionStatus.RESULTS_AGREEMENT]: 'Подготовлены предложения поставщиков по позиции',
  [PositionStatus.WINNER_SELECTED]: 'Выбран победитель по позиции',
  [PositionStatus.TCP_WINNER_SELECTED]: 'Выбран победитель по позиции',
  [PositionStatus.CONTRACT_AGREEMENT]: 'Осуществляется согласование договора с поставщиком',
  [PositionStatus.CONTRACT_SIGNING]: 'Согласован и ожидает подписания договор с победителем',
  [PositionStatus.CONTRACTED]: 'Сторонами подписан договор по позиции',
  [PositionStatus.COMPLETED]: 'Выполнен заказ по позиции',
};
