import { Uuid } from 'src/app/cart/models/uuid';

export class OffersApproveGroupModel {
  addedUserId: Uuid;
  approveType: "REFERENCE" | "MATRIX";
  created: Date;
  id: Uuid;
  increaseId: any;
  isHideContragent: boolean;
  name: string;
  scheme: 'TRADE' | 'AGENT';
  updated: Date;
}
