import { CertificateModel } from "./certificate.model";

export interface CertificateListItem {
  data: CertificateModel;
  ownerInfo: any;
  issuerInfo: any;
  serialNumber: string;
  isValid: boolean;
}
