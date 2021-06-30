import { RequestPosition } from "../../request/common/models/request-position";
import { Uuid } from "../../cart/models/uuid";

export class EmployeeListRequestPosition extends RequestPosition {
  requestNumber: number;
  requestId: Uuid;
}
