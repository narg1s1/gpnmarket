import { RequestPosition } from "./request-position";
import { ContragentList } from "../../../contragent/models/contragent-list";

export class ContragentWithPositions {
  supplier: ContragentList;
  positions: RequestPosition[];
}
