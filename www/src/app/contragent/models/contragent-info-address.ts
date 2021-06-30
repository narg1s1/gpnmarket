import { Uuid } from "../../cart/models/uuid";

export class ContragentInfoAddresses {
  id: Uuid;
  type: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postIndex: string;
  locality: string;
  createdDate: string;
}
