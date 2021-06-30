import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProposalGroup } from "../../models/proposal-group";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { FeatureService } from "../../../../core/services/feature.service";

@Component({
  selector: 'app-proposal-group',
  templateUrl: './proposal-group.component.html',
  styleUrls: ['./proposal-group.component.scss']
})
export class ProposalGroupComponent {
  @Input() group: ProposalGroup;
  @Input() editable: boolean;
  @Output() edit = new EventEmitter();
  folded = false;

  constructor(public user: UserInfoService, public featureService: FeatureService) {}

}
