export interface DeliveryMonitorCompany {
  companyId: string;
  sapCode: string;
  name: string;
  companyType: string;
  actualAddressId?: null;
  requisites?: null;
  actualAddress?: {
    rawAddress?: string;
    city?: string;
  };
}
