import {Uuid} from "../../../cart/models/uuid";
import {RequestDocument} from "./request-document";
import { DesignDocumentationType } from "../enum/design-documentation-type";

export class DesignDocumentation {
  id: Uuid;
  name: string;
  status: string;
  adjustmentDate?: string;
  adjustmentLimit: number;
  receivingDate?: string;
  receivingLimit: number;
  reviewDate?: string;
  comment: string;
  type: DesignDocumentationType;
  documents: RequestDocument[];
}
