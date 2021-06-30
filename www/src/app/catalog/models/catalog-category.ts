import { Uuid } from "../../cart/models/uuid";

export class CatalogCategory {
  id: Uuid;
  parentId: Uuid;
  ecmClass: string;
  name: string;
  createdDate: string;
  positionsCount: number;
  child?: CatalogCategory[];
}
