export class ShipmentItem {
  createdDate: Date;
  shipmentDate: Date;
  consignmentNoteNumber: string;
  status: string;
  statusLabel: string;
  weight: number;
  measureUnit: string;
  invoiceInnerNumber: string;
  invoiceOuterNumber: string;
  waybillNumber: string;
  transportCompanyOrderNumber: string;

  shipperName: string;
  consigneeName: string;
  destinationAddress: string;
  departureAddress: string;

  shippingExpectedDate: Date;
  shippingActualDate: Date;

  sentToConsigneeCityExpectedDate: Date;
  sentToConsigneeCityActualDate: Date;

  arrivedToConsigneeCityExpectedDate: Date;
  arrivedToConsigneeCityActualDate: Date;
}
