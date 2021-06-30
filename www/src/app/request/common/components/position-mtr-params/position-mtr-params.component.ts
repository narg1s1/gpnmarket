import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RequestPosition } from "../../models/request-position";
import { Observable } from "rxjs";
import { MtrPosition } from "isource-element";
import { RequestPositionService } from "../../services/request-position.service";

@Component({
  selector: 'app-position-mtr-params',
  templateUrl: './position-mtr-params.component.html',
  styleUrls: ['./position-mtr-params.component.scss']
})
export class PositionMtrParamsComponent implements OnChanges {

  @Input() title = 'Параметры МТР из справочника';
  @Input() requestPosition: RequestPosition;
  mtrPositionInfo$: Observable<MtrPosition>;

  constructor(private positionService: RequestPositionService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.getPositionMtrParams();
  }

  getPositionMtrParams() {
    this.mtrPositionInfo$ = this.positionService.getPositionMtrParams(this.requestPosition.mtrPositionId);
  }
}
