import { Component, Input } from '@angular/core';
import { ContragentList } from "../../models/contragent-list";
import { Router } from "@angular/router";
import { UserInfoService } from "../../../user/service/user-info.service";
import { FeatureService } from "../../../core/services/feature.service";

@Component({
  selector: 'app-contragent-list',
  templateUrl: './contragent-list.component.html',
  styleUrls: ['./contragent-list.component.scss']
})
export class ContragentListComponent {
  @Input() searchValue: string;
  @Input() contragents: ContragentList[];

  constructor(
    private router: Router,
    public user: UserInfoService,
    public featureService: FeatureService,
  ) {}

  mailto(ev, email): void {
    ev.preventDefault();
    ev.stopPropagation();

    window.open('mailto:' + email);
  }

  edit(ev, {id}: ContragentList) {
    ev.preventDefault();
    ev.stopPropagation();

    this.router.navigate(['/contragents', id, 'edit']);
  }
}
