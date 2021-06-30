import { Uuid } from "../../../cart/models/uuid";

export class Position<T = any> {
  id: Uuid;
  isDeliveryDateAsap?: boolean;
  deliveryDate: string;
  quantity: number;
  measureUnit: string;
  source?: 'ETP' | 'MANUAL';

  constructor(public sourcePosition?: T, toPositionFn?: (sourcePosition: T) => Position<T>) {
    Object.assign(this, (toPositionFn && toPositionFn(sourcePosition)) ?? sourcePosition);
  }
}
