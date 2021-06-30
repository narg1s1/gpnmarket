import { DeliveryMonitorCompany } from './delivery-monitor-company';
import { DeliveryMonitorCargo } from './delivery-monitor-cargo';

export class DeliveryMonitorConsignment {
  consignmentId: string;
  contractAnnexId: string;
  planeShipmentDate: null;
  deliveryNoteNumber: null;
  deliveryState: string;
  factualShipmentDate: null;
  cargos: DeliveryMonitorCargo[];
  consignor: DeliveryMonitorCompany;
  consignee?: DeliveryMonitorCompany|null;
  waybills: [
    {
      waybillNumber: string,
      rawWaybillNumber: null,
      actualDocumentLocation: null,
      loadingDate?: Date|null,
      amountSeats: number,
      cargoWeight: number,
      expectedDateOfArrival?: Date|null,
      estimatedDateOfArrival?: Date|null,
      actualArrivalDate?: Date|null,
      departureDate?: Date|null,
      consignmentId: string,
      deliveryState: string,
      weightByTd: number,
      waybillId: string,
      deliveryVehicles: [
        {
          deliveryVehicleId: string,
          shipmentDate: Date|null,
          vehicle: {
            vehicleNumber: string,
            shipmentDate: Date,
            vehicleType: string,
            vehicleId: string
          }
        }
      ]
    }
  ];
  invoice: {
    internalNumber: string,
    externalNumber: string,
    issuedAt: Date,
    invoiceId: string
  };
}
