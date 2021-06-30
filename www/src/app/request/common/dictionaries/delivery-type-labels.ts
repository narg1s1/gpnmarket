import { DeliveryType } from "../../back-office/enum/delivery-type";

export const DeliveryTypeLabels: Record<DeliveryType, string> = {
  [DeliveryType.INCLUDED]: "Доставка включена в стоимость позиций",
  [DeliveryType.NOT_INCLUDED]: "Доставка не включена в стоимость позиций",
  [DeliveryType.PICKUP]: "Самовывоз",
};
