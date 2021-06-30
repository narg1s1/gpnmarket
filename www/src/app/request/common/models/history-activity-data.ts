import { Uuid } from "../../../cart/models/uuid";
import { PositionStatus } from "../enum/position-status";

export class ActivityData {
  newStatus?: PositionStatus;
  newStatusLabel?: string;
  oldStatus?: PositionStatus;
  oldStatusLabel?: string;
  newValues?: Object;
  oldValues?: Object;
  filename?: string;
  directorFullName?: string;
  positionName?: string;
  supplierId?: Uuid;
  supplierName?: string;
  offerQuantity?: number;
  offerMeasureUnit?: string;
  offerPrice?: number;
  offerCurrency?: string;
  statusComment?: {
      comment: string;
  } & string[];
}
