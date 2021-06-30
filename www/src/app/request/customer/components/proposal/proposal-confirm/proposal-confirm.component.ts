import { Component, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";
import { Proposal } from "../../../../../shared/components/grid/proposal";
import { ProposalComponent } from "../proposal/proposal.component";
import { GridRowComponent } from "../../../../../shared/components/grid/grid-row/grid-row.component";
import { Uuid } from "../../../../../cart/models/uuid";
import { CommonProposalItem } from "../../../../common/models/common-proposal";
import { RequestPosition } from "../../../../common/models/request-position";

@Component({
  selector: 'app-common-proposal-confirm',
  templateUrl: './proposal-confirm.component.html',
  styleUrls: ['./proposal-confirm.component.scss']
})
export class ProposalConfirmComponent {
  @Input() isLoading: boolean;
  @Input() requestId: Uuid;
  @Input() groupId: Uuid;
  @Input() positions: RequestPosition[];
  @Input() proposalsOnReview: QueryList<ProposalComponent | GridRowComponent>;
  @Input() approvalModalData: {
    counters: {
      totalCounter: number,
      toApproveCounter: number,
      sendToEditCounter: number,
    },
    selectedProposals: {
      supplier: ContragentShortInfo;
      supplierIndex: number;
      toSendToEdit: Proposal<CommonProposalItem>[];
      toApprove: Proposal<CommonProposalItem>[]
    }[]
  };
  @Output() close = new EventEmitter();
  @Output() reviewMultiple = new EventEmitter();
  @Output() downloadAnalyticalReport = new EventEmitter<string>();

  filterQuery = "";
  readonly getCurrencySymbol = getCurrencySymbol;

  /**
   * Сумма выбранных предложений по поставщику
   */
  getSelectedProposalsSumBySupplier(proposals): number {
    return proposals.reduce((sum, proposal) => sum += (proposal?.priceWithoutVat * proposal.quantity ?? 0), 0);
  }

  /**
   * Сумма всех выбранных предложений по всем поставщикам
   */
  getSelectedProposalsTotalSum(proposals): number {
    const selectedToApprove = proposals.map(proposal => proposal.toApprove);
    const propsFlat = selectedToApprove.reduce((acc: [], val) => [...acc, ...val], []);

    return propsFlat.reduce((sum, p) => sum += (p.priceWithoutVat * p.quantity ?? 0), 0);
  }

  getSelectedToSendToEditPositions(selectedProposals): Proposal[] {
    const items: Proposal<CommonProposalItem>[] = selectedProposals.map(selectedProposal => selectedProposal.toSendToEdit).reduce((acc, val) => acc.concat(val), []);

    // Убираем из массива позиций повторяющиеся значения и оставляем только уникальные
    return items.filter(({ sourceProposal: { requestPositionId: id } }, i, arr) => {
      return arr.findIndex(({ sourceProposal }) => sourceProposal.requestPositionId === id) === i;
    });
  }

  /**
   * Возвращает true, если позиция отфильтрована из списка
   */
  positionIsFiltered(proposalPosition): boolean {
    const name = proposalPosition.manufacturingName || this.getPosition(proposalPosition).name;
    return name.toLowerCase().indexOf(this.filterQuery.trim().toLowerCase()) === -1;
  }

  /**
   * Возвращает true, если все позиции поставщика на утверждение отфильтрованы из списка
   */
  allPositionsToApproveFiltered(proposalPositionsBlock): boolean {
    return proposalPositionsBlock.toApprove.every(proposal => this.positionIsFiltered(proposal));
  }

  /**
   * Возвращает true, если все позиции на доработку отфильтрованы из списка
   */
  allPositionsToSendToEditFiltered(selectedToSendToEditPositions): boolean {
    return selectedToSendToEditPositions.every(proposal => this.positionIsFiltered(proposal));
  }

  getPosition(proposal: Proposal<CommonProposalItem>) {
    return this.positions.find(p => p.id === proposal.sourceProposal.requestPositionId);
  }
}
