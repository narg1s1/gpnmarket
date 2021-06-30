import { PositionCurrency } from "../enum/position-currency";

export const CurrencyLabels: Record<PositionCurrency, string> = {
  [PositionCurrency.RUB]: "Руб.",
  [PositionCurrency.USD]: "Дол.",
  [PositionCurrency.EUR]: "Евр.",
  [PositionCurrency.CHF]: "Фр.",
};
