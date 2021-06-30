import { KimPriceOrderType } from "../enum/kim-price-order-type";

export const KimPriceOrderTypeLabels: Record<KimPriceOrderType, string> = {
  [KimPriceOrderType.STANDART]: "Стандартный ЦЗ",
  [KimPriceOrderType.SINGLE_SIPPLIER]: "Закупка у единственного поставщика"
};
