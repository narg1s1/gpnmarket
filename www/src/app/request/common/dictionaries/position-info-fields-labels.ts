import { PositionInfoField } from "../enum/position-info-field";

export const PositionInfoFieldsLabels: Record<PositionInfoField, string> = {
  [PositionInfoField.CURRENCY]: 'Валюта',
  [PositionInfoField.DELIVERY_BASIS]: 'Базис поставки',
  [PositionInfoField.DELIVERY_DATE]: 'Дата поставки',
  [PositionInfoField.IS_DELIVERY_DATE_ASAP]: 'Срочная поставка',
  [PositionInfoField.MEASURE_UNIT]: 'Единица измерения',
  [PositionInfoField.NAME]: 'Наименование позиции',
  [PositionInfoField.PAYMENT_TERMS]: 'Условия оплаты',
  [PositionInfoField.PRODUCTION_DOCUMENT]: 'Документ изготовления',
  [PositionInfoField.QUANTITY]: 'Количество',
  [PositionInfoField.START_PRICE]: 'Начальная максимальная цена без НДС',
  [PositionInfoField.RELATED_SERVICES]: 'Необходимость сопутствующих услуг',
  [PositionInfoField.COMMENTS]: 'Дополнительные требования',
};

