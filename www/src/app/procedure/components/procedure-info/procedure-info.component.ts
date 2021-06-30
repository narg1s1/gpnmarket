import { UserInfoService } from './../../../user/service/user-info.service';
import { ProcedureService } from './../../../request/back-office/services/procedure.service';
import { ToastActions } from 'src/app/shared/actions/toast.actions';
import { Store } from '@ngxs/store';
import { PositionsService } from './../../../positions/positions.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Host,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Procedure } from "../../../request/back-office/models/procedure";
import moment from "moment";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../../core/config/gpnmarket-config.interface";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { FeatureService } from "../../../core/services/feature.service";

@Component({
  selector: 'app-procedure-info',
  templateUrl: './procedure-info.component.html',
  styleUrls: ['./procedure-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureInfoComponent implements OnInit {

  @Input() procedure: Procedure;
  @Output() bargain = new EventEmitter();
  @Output() prolong = new EventEmitter();
  @Output() refresh = new EventEmitter();

  limit = 5;
  timezone: string;
  datePublished: string;
  dateSummingUp: string;
  dateStartRegistration: any;
  dateEndRegistration: string;
  showAllPositions = true;
  showAllContragents: boolean;
  contragentsColumnHeaders = [
    {name: 'Наименование', alias: 'name', isVisible: true},
    {name: 'E-mail', alias: 'email', isVisible: true},
    {name: 'Телефон', alias: 'phone', isVisible: true},
    {name: 'Ответственный', alias: 'responsibleUser', isVisible: true},
  ];
  positionsColumnHeaders = [
    {name: 'Наименование', alias: 'name', isVisible: true, customStyles: {'min-width': '500px'}},
    {name: 'Количество', alias: 'quantity', isVisible: true, customStyles: {'min-width': '100px'}},
    {name: 'Цена с НДС', alias: 'startPrice', isVisible: true, customStyles: {'min-width': '250px'}},
    {name: 'Срок поставки', alias: 'deliveryDate', isVisible: true, customStyles: {'min-width': '100px'}},
  ];

  get link(): string {
    return this.appConfig.procedure.url + this.procedure.procedureId;
  }

  get resultLink(): string {
    return this.appConfig.procedure.resultUrl + this.procedure.lotId;
  }

  constructor(
    @Inject(APP_CONFIG)
    private appConfig: GpnmarketConfigInterface,
    public featureService: FeatureService,
    private positionsService: PositionsService,
    private store: Store,
    public procedureService: ProcedureService,
    public userInfo: UserInfoService
  ) {}

  ngOnInit() {
    /* tslint:disable:no-bitwise */
    this.dateStartRegistration = moment(this.procedure.dateStartRegistration?.date)
      .add(~parseInt(this.procedure.dateStartRegistration?.timezone, 10) + 1, 'hours')
      .add(~new Date().getTimezoneOffset() + 1, 'minutes')
      .format('DD.MM.YYYY HH:mm');
    this.dateEndRegistration = moment(this.procedure.dateEndRegistration?.date)
      .add(~parseInt(this.procedure.dateEndRegistration?.timezone, 10) + 1, 'hours')
      .add(~new Date().getTimezoneOffset() + 1, 'minutes')
      .format('DD.MM.YYYY HH:mm');
    this.datePublished = moment(this.procedure.datePublished?.date)
      .add(~parseInt(this.procedure.datePublished?.timezone, 10) + 1, 'hours')
      .add(~new Date().getTimezoneOffset() + 1, 'minutes')
      .format('DD.MM.YYYY HH:mm');
    this.dateSummingUp = moment(this.procedure.dateSummingUp?.date)
      .add(~parseInt(this.procedure.dateSummingUp?.timezone, 10) + 1, 'hours')
      .add(~new Date().getTimezoneOffset() + 1, 'minutes')
      .format('DD.MM.YYYY HH:mm');
    this.timezone = moment(this.procedure?.dateEndRegistration.date).format('Z');
    /* tslint:enable:no-bitwise */
  }

  canceled(): boolean {
    return this.procedure?.isCanceled;
  }

  finished(): boolean {
    return moment(this.procedure?.dateEndRegistration.date).isBefore();
  }

  getProcedurePositions() {
    return Object.values(this.procedure.positions);
  }

  getProcedureContragents(): ContragentShortInfo[] {
    // Если showAllPositions = true или не указан limit — возвращаем всё
    return this.procedure.privateAccessContragents.slice(0, this.showAllContragents ? this.procedure.privateAccessContragents.length : (this.limit || this.procedure.privateAccessContragents.length));
  }

  procedureIsFinished(): boolean {
    return this.procedureService.dateEndRegistrationFinished(this.procedure) && this.procedureService.dateSummingUpFinished(this.procedure);
  }

  procedureIsRetrade(): boolean {
    return this.procedure?.isRetrade;
  }

  canRetradeProcedure(): boolean {
    return this.procedure?.canRetrade;
  }

  prolongButtonIsDisabled(): boolean {
    return this.procedureIsFinished() || this.procedureIsRetrade() || this.procedureService.dateSummingUpFinished(this.procedure);
  }

  // Дизейблим кнопку уторговывания, если процедура завершена полностью
  // или если по процедуре объявлено уторговывание
  // или если по процедуре идёт приём предложений (дата приёма заявок ещё не наступила) и при этом не объявлено уторговывание
  // или завершен прием заявок, но еще не отработал крон
  // или если процедуру нельзя уторговать, т.к. нет позиций с 2 и более предложениями
  // или если закончилась дата подведения итогов
  // TODO Перенести логику определения возможности продления и уторговывания на бэк!
  retradeButtonIsDisabled(): boolean {
    return this.procedureIsFinished() ||
      (this.procedureIsRetrade() && !this.procedureService.dateEndRegistrationFinished(this.procedure)) ||
      !this.procedureService.dateEndRegistrationFinished(this.procedure) ||
      !this.canRetradeProcedure() ||
      this.procedureService.dateSummingUpFinished(this.procedure);
  }

  // Меняем ответственного
  changeResponsibleUser({user}) {
    this.positionsService.changeResponsibleUser(user.id, [], [], false, {}, this.procedure.procedureId)
      .subscribe(() => {
        this.store.dispatch(new ToastActions.Success(`Позиции в процедуре назначены`));
        this.refresh.emit();
      }, () => {
        this.store.dispatch(new ToastActions.Error(`Не удалось назначить позиции в процедуре`));
      });
  }
}
