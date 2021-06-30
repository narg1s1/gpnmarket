import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Request } from "../../../../common/models/request";
import { TechnicalProposal } from "../../../../common/models/technical-proposal";

@Component({
  selector: 'app-request-backoffice-technical-proposal',
  templateUrl: './technical-proposal.component.html'
})
export class TechnicalProposalComponent {
  @Input() request: Request;
  @Input() technicalProposal: TechnicalProposal;
  @Output() update = new EventEmitter<TechnicalProposal>();
  @Output() cancelTechnicalProposal = new EventEmitter<TechnicalProposal>();
  editing: boolean;
}
