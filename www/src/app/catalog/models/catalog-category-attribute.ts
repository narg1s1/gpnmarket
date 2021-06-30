import { Uuid } from "../../cart/models/uuid";
import { CatalogCategory } from "./catalog-category";

export class CatalogCategoryAttribute {
  id: Uuid;
  name: string;
  catalogCategory: CatalogCategory;
  catalogCategoryId: Uuid;
  values: CatalogCategoryAttributeValue[];
  parent?: CatalogCategoryAttribute;
  parentId?: Uuid;
  children: CatalogCategoryAttribute[];
}

export class CatalogCategoryAttributeValue {
  id: Uuid;
  value: string;
}
