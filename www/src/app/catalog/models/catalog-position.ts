import { Uuid } from "../../cart/models/uuid";
import { ContragentInfo } from "../../contragent/models/contragent-info";
import { CatalogCategoryAttribute } from "./catalog-category-attribute";

export class CatalogPosition {
  attributes: CatalogCategoryAttribute[];
  id: Uuid;
  name: string;
  measureUnit: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  supplierContragent: ContragentInfo;
  supplierContragentName?: string;
  supplierContragentId?: string;
  productionDocument: string;
  productionTime: number;
  createdDate: string;
  inStock: number;
}
