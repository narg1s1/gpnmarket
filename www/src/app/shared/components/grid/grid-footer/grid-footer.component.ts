import { Proposal } from './../proposal';
import { OffersApproveGroupModel } from './../../../../procedure/models/offers-approve-group.model';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Subject } from "rxjs";
import { getCurrencySymbol } from "@angular/common";
import { TechnicalCommercialProposalPosition } from "../../../../request/common/models/technical-commercial-proposal-position";
import { ProposalsView } from "../../../models/proposals-view";

@Component({
  selector: 'app-grid-footer',
  templateUrl: './grid-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridFooterComponent {
  @Input() chooseBy$: Subject<"price" | "date">;
  @Input() total: number;
  @Input() selectedProposals: { toApprove, toSendToEdit };
  @Input() selectedPositions;
  @Input() view: ProposalsView;
  @Input() source: string;
  @Input() disabled: boolean;
  @Input() loading: boolean;
  @Input() isCanApprove;
  @Input() offersApproveGroup?: OffersApproveGroupModel;
  @Output() selectAllToSendToEdit = new EventEmitter();
  @Output() approve = new EventEmitter();
  @Output() reject = new EventEmitter();
  @Output() sendToEdit = new EventEmitter<string>();
  @Output() approveFromListView = new EventEmitter();
  @Output() sendToEditFromListView = new EventEmitter();
  @HostBinding('class.hidden') @Input() hidden: boolean;
  @HostBinding('class.proposals-footer') proposalsFooter = true;
  readonly getCurrencySymbol = getCurrencySymbol;
  sendToEditComment = null;

  get isApproveButtonDisabled(): boolean {
    return this.loading || (this.isCanApprove ? false : !this.selectedProposals?.toApprove?.length && !this.selectedProposals?.toSendToEdit?.length);
  }

  get uniqWinners() {
    return this.selectedProposals.toApprove?.reduce((uniqProposals: Proposal[], proposal: Proposal) => {
      if (uniqProposals.find(prop => prop.supplierContragent?.id === proposal.supplierContragent?.id)) {
        return uniqProposals;
      } else {
        return [...uniqProposals, proposal];
      }
    }, []) || [];
  }

  get uniqSendToEdit() {
    return this.selectedProposals.toSendToEdit?.reduce((uniqSendToEdit: Proposal[], proposal: Proposal) => {
      if (uniqSendToEdit.find(prop => prop.requestPositionId === proposal.requestPositionId)) {
        return uniqSendToEdit;
      } else {
        return [...uniqSendToEdit, proposal];
      }
    }, []) || [];
  }

  getSummaryPriceByPositions(positions: TechnicalCommercialProposalPosition[]): number {
    return positions.map(position => position.priceWithoutVat * position.quantity).reduce((sum, priceWithoutVat) => sum + priceWithoutVat, 0);
  }
}
