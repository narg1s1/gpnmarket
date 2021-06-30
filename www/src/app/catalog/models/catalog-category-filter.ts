import { Uuid } from "../../cart/models/uuid";

export class CatalogCategoryFilter {
  productionTime: [number, number];
  price: [number, number];
  contragents: Uuid[];
  attributes: Uuid[];
}
