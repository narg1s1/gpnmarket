import { Uuid } from "../../../cart/models/uuid";

export class ClassifierCategory {
  id: Uuid;
  code: number;
  name: string;
  okpd2: string;
  okved2: string;
  createdDate: Date;
}
