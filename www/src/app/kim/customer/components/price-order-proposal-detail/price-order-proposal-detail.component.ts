import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { KimPriceOrder } from "../../../common/models/kim-price-order";
import { KimPriceOrderProposal } from "../../../common/models/kim-price-order-proposal";
import { KimPriceOrderPosition } from "../../../common/models/kim-price-order-position";
import { Position } from "../../../../shared/components/grid/position";
import { Proposal } from "../../../../shared/components/grid/proposal";
import { ProposalHelperService } from "../../../../shared/components/grid/proposal-helper.service";

@Component({
  selector: 'app-kim-price-order-proposal-detail',
  templateUrl: './price-order-proposal-detail.component.html',
  styleUrls: ['./price-order-proposal-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderProposalDetailComponent {

  @Input() priceOrder: KimPriceOrder;
  @Input() position: Position<KimPriceOrderPosition>;
  @Input() proposal: Proposal<KimPriceOrderProposal>;
  getCurrencySymbol = getCurrencySymbol;

  constructor(public helper: ProposalHelperService) {}
}
