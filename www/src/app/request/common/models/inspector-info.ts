export class InspectorInfo {
  mtrEventId: string;
  goodId: string;
  occurredAt: string;
  type: string;
  payload: CertificateUploaded | PackagesLeftProduction;
}

interface CertificateUploaded {
  certificateId: string;
}
interface PackagesLeftProduction {
  productionOperationLinkId: string;
}
