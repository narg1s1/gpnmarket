import { Uuid } from "../../cart/models/uuid";
import { CatalogCategory } from "./catalog-category";
import { CatalogPosition } from "./catalog-position";

export class SearchResults {
  categories: CatalogCategory[];
  positions: CatalogPosition[];
}
