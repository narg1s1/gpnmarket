import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormDataService } from "../../../shared/services/form-data.service";
import { KimPriceOrder } from "../../common/models/kim-price-order";
import { Uuid } from "../../../cart/models/uuid";

@Injectable()
export class KimPriceOrderService {
  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  list() {
    const url = `kim/customer/price-order/list`;
    return this.api.get<KimPriceOrder[]>(url);
  }

  create(body: Partial<KimPriceOrder>) {
    const url = `kim/customer/add-price-order/manual`;
    return this.api.post(url, this.formDataService.toFormData(body));
  }

  proposals(priceOrderId: Uuid) {
    const url = `kim/customer/price-order/${priceOrderId}/proposals`;
    return this.api.get<KimPriceOrder>(url);
  }

  approve(priceOrderId: Uuid, proposalId: Uuid) {
    const url = `kim/customer/price-order/${priceOrderId}/proposals/${proposalId}/approve`;
    return this.api.get<KimPriceOrder>(url);
  }

  approveMultiple(priceOrderId: Uuid, proposalIds: Uuid[]) {
    const url = `kim/customer/price-order/${priceOrderId}/proposals/choose-winners`;
    return this.api.post<KimPriceOrder>(url, { proposalIds });
  }
}


