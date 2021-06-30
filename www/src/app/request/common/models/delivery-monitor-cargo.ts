export interface DeliveryMonitorCargo {
  cargoId: string;
  eiCargoAmount?: string|null;
  amountEi?: number|null;
  numberPositionSf?: string|null;
  isLong?: null|boolean;
  isPonderous?: null|boolean;
  weightByTd?: number|null;
  eiWeightByProvider?: string|null;
  amountSeatsByTd?: number|null;
  cargoNameByTd?: string|null;
  weightFromProvider?: number|null;
}
