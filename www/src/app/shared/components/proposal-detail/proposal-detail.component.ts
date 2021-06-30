import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { RequestDocument } from "../../../request/common/models/request-document";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { ContragentList } from "../../../contragent/models/contragent-list";
import { Proposal } from "../grid/proposal";
import { ProposalHelperService } from "../grid/proposal-helper.service";
import { Position } from "../grid/position";

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss'],
})
export class ProposalDetailComponent {

  @Input() documents: RequestDocument[];
  @Input() supplier: ContragentShortInfo | ContragentList;
  @Input() position: Position;
  @Input() paymentTerms: string;
  @Input() manufacturingName: string;
  @Input() proposal: Proposal;
  @Input() manufacturer: string;
  @Input() standard: string;
  getCurrencySymbol = getCurrencySymbol;

  constructor(public helper: ProposalHelperService) {}
}
