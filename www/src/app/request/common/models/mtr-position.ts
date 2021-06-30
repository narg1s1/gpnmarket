import { Uuid } from "../../../cart/models/uuid";

export class MtrPosition {
  active: boolean;
  category: any;
  categoryCode: string;
  createdDate: string;
  dateUpdate: string;
  deleted: boolean;
  endDate: string;
  etpCode: string;
  externalPositionId: number;
  id: Uuid;
  idClosure: [];
  mergerId: any;
  name: string;
  okei: any;
  okeiCode: string;
  standardCode: string;
  standardPositionName: string;
  values: [
    {
      attributes: [];
      externalAttributeId: number;
      id: Uuid;
      idClosure: [];
      name: string;
      value: string;
    }
  ];
}
