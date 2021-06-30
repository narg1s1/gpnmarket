import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Procedure } from "../../../models/procedure";
import moment from "moment";
import { RequestPosition } from "../../../../common/models/request-position";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../../core/config/gpnmarket-config.interface";
import { FormBuilder } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { searchPosition } from "../../../../../shared/helpers/search";
import { Observable } from "rxjs";
import { FeatureService } from "../../../../../core/services/feature.service";

@Component({
  selector: 'app-procedure-grid',
  templateUrl: './procedure-grid.component.html',
  styleUrls: ['./procedure-grid.component.scss']
})
export class ProcedureGridComponent implements OnInit {
  @Input() procedure: Procedure;
  @Input() source: string;
  @Output() bargain = new EventEmitter();
  @Output() prolong = new EventEmitter();

  readonly form = this.fb.group({ search: '' });
  procedurePositions$: Observable<RequestPosition[]>;

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    private fb: FormBuilder,
    public featureService: FeatureService
  ) { }

  ngOnInit(): void {
    this.procedurePositions$ = this.form.get('search').valueChanges.pipe(
      startWith(<{}>this.form.get('search').value)).pipe(
      map(q => this.procedure.positions.map(({ requestPosition }) => requestPosition).filter(position => searchPosition(q, position)))
    );
  }

  canceled(procedure: Procedure): boolean {
    return procedure?.isCanceled;
  }

  finished(procedure: Procedure): boolean {
    return moment(procedure?.dateEndRegistration).isBefore();
  }

  link(procedure: Procedure): string {
    return this.appConfig.procedure.url + procedure.procedureId;
  }

  resultLink(procedure: Procedure): string {
    return this.appConfig.procedure.resultUrl + procedure.lotId;
  }

  dateEndRegistrationFinished(): boolean {
    return moment(this.procedure?.dateEndRegistration).isBefore();
  }

  dateSummingUpFinished(): boolean {
    return moment(this.procedure?.dateSummingUp).isBefore();
  }

  procedureIsFinished(): boolean {
    return this.dateEndRegistrationFinished() && this.dateSummingUpFinished();
  }

  procedureIsRetrade(): boolean {
    return this.procedure?.isRetrade;
  }

  canRetradeProcedure(): boolean {
    return this.procedure?.canRetrade;
  }

  prolongButtonIsDisabled(): boolean {
    return this.procedureIsFinished() || this.procedureIsRetrade();
  }

  // Дизейблим кнопку уторговывания, если процедура завершена полностью
  // или если по процедуре объявлено уторговывание
  // или если по процедуре идёт приём предложений (дата приёма заявок ещё не наступила) и при этом не объявлено уторговывание
  // или завершен прием заявок, но еще не отработал крон
  // или если процедуру нельзя уторговать, т.к. нет позиций с 2 и более предложениями
  // TODO Перенести логику определения возможности продления и уторговывания на бэк!
  retradeButtonIsDisabled(): boolean {
    return this.procedureIsFinished() ||
      (this.procedureIsRetrade() && !this.dateEndRegistrationFinished()) ||
      !this.dateEndRegistrationFinished() ||
      !this.canRetradeProcedure();
  }
}
