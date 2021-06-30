import { CatalogPosition } from "../../catalog/models/catalog-position";

export class CartItem {
  catalogPosition: CatalogPosition;
  quantity?: number;

  constructor(params?: Partial<CartItem>) {
    Object.assign(this, params);
  }

  getSum(): number {
    const quantity = this.quantity || 0;
    const price = this.catalogPosition.price || 0;
    return quantity * price;
  }
}
