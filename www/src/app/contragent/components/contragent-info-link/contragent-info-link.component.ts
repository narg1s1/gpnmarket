import { Component, Input, OnInit } from '@angular/core';
import { Uuid } from "../../../cart/models/uuid";
import { ContragentInfo } from "../../models/contragent-info";
import { ContragentService } from "../../services/contragent.service";
import { Observable } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { ContragentShortInfo } from "../../models/contragent-short-info";

@Component({
  selector: 'app-contragent-info-link',
  templateUrl: './contragent-info-link.component.html',
  styleUrls: ['./contragent-info-link.component.scss']
})
export class ContragentInfoLinkComponent implements OnInit {

  @Input() contragent: ContragentInfo | ContragentShortInfo | { id: Uuid, shortName? };
  @Input() hiddenName = 'Поставщик';

  contragentInfo$: Observable<ContragentInfo>;
  isModalOpened = false;

  constructor(private contragentService: ContragentService) { }

  ngOnInit() {
    this.contragentInfo$ = this.contragentService.getContragentInfo(this.contragent.id)
      .pipe(shareReplay(1));
  }

  showContragentInfo(event: MouseEvent, contragentId: Uuid): void {
    // При клике не даём открыться ссылке из href, вместо этого показываем модальное окно
    event.preventDefault();
    this.isModalOpened = true;
  }
}
