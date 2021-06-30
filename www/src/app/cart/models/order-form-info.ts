export class OrderFormInfo {
  deliveryDate: Date|null = null;
  isDeliveryDateAsap = false;
  deliveryBasis = '';
  paymentTerms = '30 банковских дней по факту поставки';

  constructor(params: Partial<OrderFormInfo>) {
    Object.assign(this, params);
  }
}
