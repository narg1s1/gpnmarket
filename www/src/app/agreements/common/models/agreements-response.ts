import { RequestPosition } from "../../../request/common/models/request-position";
import { Agreement } from "./Agreement";

export class AgreementsResponse {
  totalCount: number;
  entities: RequestPosition[] | Agreement[];
}
