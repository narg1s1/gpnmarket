import { GridSupplier } from './grid-supplier';
import { Injectable } from "@angular/core";
import * as moment from "moment";
import { Position } from "./position";
import { Proposal } from "./proposal";
import { TechnicalCommercialProposalByPosition } from "../../../request/common/models/technical-commercial-proposal-by-position";
import { TechnicalCommercialProposalPosition } from "../../../request/common/models/technical-commercial-proposal-position";
import { CommonProposal, CommonProposalItem } from "../../../request/common/models/common-proposal";
import { RequestPosition } from "../../../request/common/models/request-position";

@Injectable({
  providedIn: "root"
})
export class ProposalHelperService {

  isValid(position: Position, proposal: Proposal): boolean {
    return this.isDateValid(position, proposal) && this.isQuantityValid(position, proposal);
  }

  isDateValid(position: Position, { deliveryDate }: Proposal): boolean {
    return position.isDeliveryDateAsap ||
      moment(deliveryDate).isSameOrBefore(moment(position.deliveryDate));
  }

  isQuantityValid(position: Position, { quantity }: Proposal): boolean {
    const positionQuantity = Math.round((position.quantity * 1000) / 1000);
    const proposalQuantity = Math.round((quantity * 1000) / 1000);
    return positionQuantity === proposalQuantity;
  }

  isPositionsValid(proposals: TechnicalCommercialProposalPosition[], positions: TechnicalCommercialProposalByPosition[]): boolean {
    return proposals.length >= positions.length;
  }

  isProposalQuantityValid(proposal: CommonProposal, positions: RequestPosition[], hasAnalogs: boolean): boolean {
    return proposal.items.filter(({isAnalog}) => isAnalog === hasAnalogs).length >= positions.length;
  }

  isQuantityPositionsValid(items: CommonProposalItem[], positions: RequestPosition[], hasAnalogs: boolean): boolean {
    const filteredProposals = items.filter(position => position.isAnalog === hasAnalogs);

    return filteredProposals.every(({ quantity, requestPositionId }) => {
      const position = positions.find(p => p.id === requestPositionId);
      const positionQuantity = Math.round((position.quantity * 1000) / 1000);
      const proposalQuantity = Math.round((quantity * 1000) / 1000);
      return positionQuantity === proposalQuantity;
    });
  }

  isDatePositionsValid(items: CommonProposalItem[], positions: RequestPosition[], hasAnalogs: boolean): boolean {
    const filteredProposals = items.filter(position => position.isAnalog === hasAnalogs);

    return filteredProposals.every(
      (item) => {
        const position = positions.find(p => p.id === item.requestPositionId);

        return moment(item.deliveryDate).isSameOrBefore(moment(position.deliveryDate))
        || position.isDeliveryDateAsap;
      });
  }

  getSummaryPrice(positions: CommonProposalItem[], hasAnalogs: boolean) {
    return positions
      .map(position => position.isAnalog === hasAnalogs ? position.priceWithoutVat * position.quantity : 0)
      .reduce((sum, priceWithoutVat) => sum + priceWithoutVat, 0);
  }

  getRequestedQuantityLabel(position: Position, { quantity }: Proposal): string {
    return quantity > position.quantity ?
      ' - Количество больше нужного' :
      ' - Количество меньше нужного';
  }

  chooseBy(type: "date" | "price", position: Position, proposals: Proposal[]): Proposal["sourceProposal"] {
    return proposals.reduce((prev, curr) => {
      // Если выбран автовыбор по дате, дополнительно
      // проверяем соседние предложения на валидность
      if (type === 'date') {
        const prevValid = prev && this.isValid(position, prev);
        const currValid = curr && this.isValid(position, curr);
        if (prevValid && !currValid) { return prev; }
        if (!prevValid && currValid) { return curr; }
      }

      switch (type) {
        case "price":
          return prev.priceWithoutVat <= curr.priceWithoutVat ? prev : curr;
        case "date":
          if (moment(prev.deliveryDate).isSame(curr.deliveryDate)) {
            return prev.priceWithoutVat <= curr.priceWithoutVat ? prev : curr;
          } else {
            return moment(prev.deliveryDate).isBefore(curr.deliveryDate) ? prev : curr;
          }
      }
    }).sourceProposal;
  }
}
