import { Injectable } from "@angular/core";
import { TechnicalCommercialProposalPosition } from "../models/technical-commercial-proposal-position";
import * as moment from "moment";
import { TechnicalCommercialProposalByPosition } from "../models/technical-commercial-proposal-by-position";
import { TechnicalCommercialProposal } from "../models/technical-commercial-proposal";
import { CommonProposal, CommonProposalItem } from "../models/common-proposal";
import { RequestPosition } from "../models/request-position";

@Injectable({
  providedIn: "root"
})
export class TechnicalCommercialProposalHelperService {

  isValid(proposalPosition: CommonProposalItem, position: RequestPosition): boolean {
    return this.isDateValid(proposalPosition, position) && this.isQuantityValid(proposalPosition, position);
  }

  isDateValid(proposalPosition: CommonProposalItem, position: RequestPosition): boolean {
    return position?.isDeliveryDateAsap ||
      moment(proposalPosition?.deliveryDate).isSameOrBefore(moment(position?.deliveryDate));
  }

  isQuantityValid(proposalPosition: CommonProposalItem, position: RequestPosition): boolean {
    return proposalPosition?.quantity === position?.quantity;
  }

  getRequestedQuantityLabel(proposalPosition: CommonProposalItem, position: RequestPosition): string {
    return proposalPosition?.quantity > position?.quantity ?
      ' - Количество больше нужного' :
      ' - Количество меньше нужного';
  }

  getSummaryPrice(positions: CommonProposalItem[]): number {
    return positions.map(position => position.priceWithoutVat * position.quantity).reduce((sum, priceWithoutVat) => sum + priceWithoutVat, 0);
  }

  chooseBy(type: "date" | "price", position: RequestPosition, items: CommonProposalItem[]): CommonProposalItem {
    return items?.reduce((prev, curr) => {

      if (type === 'date') {
        const prevValid = prev && this.isValid(prev, position);
        const currValid = curr && this.isValid(curr, position);
        if (prevValid && !currValid) { return prev; }
        if (!prevValid && currValid) { return curr; }
      }

      switch (type) {
        case "price":
          return prev?.priceWithoutVat <= curr?.priceWithoutVat ? prev : curr;
        case "date":
          if (!prev) { return curr; }
          if (!curr) { return prev; }

          if (moment(prev?.deliveryDate).isSame(curr?.deliveryDate)) {
            return prev?.priceWithoutVat <= curr?.priceWithoutVat ? prev : curr;
          } else {
            return moment(prev?.deliveryDate).isBefore(curr?.deliveryDate) ? prev : curr;
          }
      }
    }, null);
  }
}
