import { Uuid } from "../../cart/models/uuid";

export class ContragentInfoBankRequisites {
  id: Uuid;
  createdDate: Date;
  account: string;
  correspondentAccount: string;
  bik: string;
  name: string;
  address: string;
}
