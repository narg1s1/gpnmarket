import {Uuid} from "../../../../cart/models/uuid";

export class ContractCreate {
  supplierId: Uuid;
  requestId: Uuid;
  positions: Uuid[];
  useAllPositions?: boolean;
}
