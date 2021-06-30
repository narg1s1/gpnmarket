import {Uuid} from "../../../cart/models/uuid";
import { RequestDocument } from "./request-document";

export class RequestContract {
  createdDate: string;
  customerContragentId: Uuid;
  id: Uuid;
  lotId: Uuid;
  requestId: Uuid;
  requestOfferPositionId: Uuid;
  requestPositionWinnerId: Uuid;
  requestPositionId: Uuid;
  supplierContragentId: Uuid;
  comments?: string;
  documents?: RequestDocument[];
}
