import {Uuid} from "../../cart/models/uuid";

export class Contragent {
  id: Uuid;
  fullName: string;
  shortName: string;

  constructor(params?: Partial<Contragent>) {
    Object.assign(this, params);
  }
}
