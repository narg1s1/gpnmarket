import { RequestPosition } from "../../common/models/request-position";

export class ProcedureAction {
  action: "create" | "prolong" | "bargain";
  position?: RequestPosition;
}
