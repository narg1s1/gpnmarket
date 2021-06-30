import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Agreement } from "../../models/Agreement";
import { AgreementActionLink } from "../../../back-office/dictionaries/agreement-action-link";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { UxgModalComponent } from "uxg";

@Component({
  selector: 'app-agreements',
  templateUrl: './agreements.component.html',
  styleUrls: ['./agreements.component.scss']
})
export class AgreementsComponent {
  @Input() agreements: Agreement[];
  @Input() dashboardView = false;
  @Input() agreementsView = false;
  @Output() sendRating = new EventEmitter<{requestId, positionId, rating}>();

  constructor(public userInfoService: UserInfoService) {}

  getRouterLink(agreement: Agreement): any[] {
    if (agreement.action.label === 'Перейти в чат') {
      return ['/im/', agreement.request.id];
    } else {
      const routerLink = [this.userInfoService.isCustomer() ? '/requests/customer/' : '/requests/backoffice/', agreement.request.id];
      if (AgreementActionLink[agreement.action.name]) {
        routerLink.push(AgreementActionLink[agreement.action.name]);
      }
      if (agreement.type === 'REQUEST_TECHNICAL_COMMERCIAL_PROPOSAL_GROUP') {
        if (this.userInfoService.isCustomer()) {
          routerLink.pop();
          routerLink.push('offers-approve-groups');
        }
        routerLink.push(agreement.requestTechnicalCommercialProposalGroup.offersApproveGroupId);
      }
      return routerLink;
    }
  }
}
