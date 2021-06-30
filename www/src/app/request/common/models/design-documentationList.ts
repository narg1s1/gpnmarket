import {Uuid} from "../../../cart/models/uuid";
import {DesignDocumentation} from "./design-documentation";
import {RequestPosition} from "./request-position";
import {DesignDocumentationStatus} from "../enum/design-documentation-status";

export class DesignDocumentationList {
  id: Uuid;
  position: RequestPosition;
  designDocs: DesignDocumentation[];
  status: DesignDocumentationStatus;
}
