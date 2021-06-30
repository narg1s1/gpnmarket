import { RequestDocument } from "./request-document";

export class PositionDocuments {
  general: RequestDocument[];
  tp: RequestDocument[];
  tcp: RequestDocument[];
  cp: RequestDocument[];
  contract: RequestDocument[];
  rkd: RequestDocument[];
  [key: string]: RequestDocument[];
}
