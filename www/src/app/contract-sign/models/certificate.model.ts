export interface CertificateModel {
  name: string;
  issuerName: string;
  subjectName: string;
  thumbprint: string;
  validFrom: string;
  validTo: string;
}
