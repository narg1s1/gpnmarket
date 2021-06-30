import {Uuid} from "../../../cart/models/uuid";
import {User} from "../../../user/models/user";

export class RequestDocument {
  id: Uuid;
  user?: User;
  created: string;
  filename: string;
  extension: string;
  mime: string;
  size: number;
  comments?: string;
  hash?: string;
  hasSignedStorageFile?: boolean;
  documentSignatures?: {
    certNumber: string;
    contragentId: Uuid;
    hash: string;
    id: Uuid;
    issuerName: string;
    ownerName: string;
    signature: string;
    signedDate: string;
  }[];
}
