import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Procedure } from "../../../models/procedure";
import moment from "moment";
import { RequestDocument } from "../../../../common/models/request-document";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../../../core/config/gpnmarket-config.interface";
import { Request } from "../../../../common/models/request";
import { FeatureService } from "../../../../../core/services/feature.service";

@Component({
  selector: 'app-request-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.scss']
})
export class ProcedureComponent {
  @Input() procedure: Procedure;
  @Input() request: Request;
  @Input() source: string;
  @Output() bargain = new EventEmitter();
  @Output() prolong = new EventEmitter();
  folded: boolean;

  get documents(): RequestDocument[] {
    return [...this.procedure?.procedureDocuments, ...this.procedure?.procedureLotDocuments];
  }

  get finished(): boolean {
    return moment(this.procedure?.dateEndRegistration).isBefore();
  }

  get link(): string {
    return this.appConfig.procedure.url + this.procedure.procedureId;
  }

  get resultLink(): string {
    return this.appConfig.procedure.resultUrl + this.procedure.lotId;
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
  // или если процедуру нельзя уторговать, т.к. нет позиций с 2 и более предложениями
  // TODO Перенести логику определения возможности продления и уторговывания на бэк!
  retradeButtonIsDisabled(): boolean {
    return this.procedureIsFinished() ||
      (this.procedureIsRetrade() && !this.dateEndRegistrationFinished()) ||
      !this.dateEndRegistrationFinished() ||
      !this.canRetradeProcedure();
  }

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    public featureService: FeatureService
  ) {
  }
}
