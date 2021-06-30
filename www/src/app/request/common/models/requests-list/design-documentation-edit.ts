import { Uuid } from "../../../../cart/models/uuid";

export class DesignDocumentationEdit {
  id: Uuid;
  name: string;
  adjustmentLimit: number;
  receivingLimit: number;
  comment: string;
}
