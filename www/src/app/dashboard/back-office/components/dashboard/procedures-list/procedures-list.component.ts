import { PositionsService } from './../../../../../positions/positions.service';
import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { Procedure } from "../../../../../request/back-office/models/procedure";
import moment from "moment";
import { StateStatus } from "../../../../../request/common/models/state-status";
import { FormControl, FormGroup } from "@angular/forms";
import { FeatureService } from "../../../../../core/services/feature.service";
import { ToastActions } from 'src/app/shared/actions/toast.actions';

@Component({
  selector: 'app-procedures-list',
  templateUrl: './procedures-list.component.html',
  styleUrls: ['./procedures-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProceduresListComponent implements OnDestroy {
  @Input() procedures: Procedure[];
  @Input() proceduresTotalCount: number;
  @Input() status: StateStatus;
  @Input() view: 'full-list';
  @Input() filterForm: FormGroup;
  @Output() importProcedureOffers = new EventEmitter();
  @Output() procedureBargain = new EventEmitter();
  @Output() cancelProcedure = new EventEmitter();

  getCurrencySymbol = getCurrencySymbol;
  selectedProcedure: Procedure = null;

  destroy$ = new Subject();

  public proceduresListForm = new FormGroup({
    selectedProcedure: new FormControl(null),
  });

  public get isDisableCancelProcedureButton(): boolean {
    return !this.selectedProcedure
        || this.selectedProcedure.isCanceled
        || this.dateSummingUpFinished()
        || !this.selectedProcedure.isAvailableCancelProcedureByImportedOffers;
  }

  constructor(
    public store: Store,
    public featureService: FeatureService,
    private positionsService: PositionsService,
  ) { }


  getStatusLabel(procedure) {
    const finished = moment(procedure?.dateEndRegistration).isBefore();

    if (procedure?.isCanceled) {
      return 'CANCELED';
    } else if (finished && !procedure?.offersImported) {
      return 'WAITING_OFFERS_IMPORT';
    } else if (finished && procedure?.offersImported) {
      return 'PROCEDURE_FINISHED';
    } else {
      return 'PROCEDURE_ACTIVE';
    }
  }

  canceled(): boolean {
    return this.selectedProcedure?.isCanceled;
  }

  selectProcedure(event, procedure) {
    event.stopPropagation();
    event.preventDefault();
    this.proceduresListForm.get('selectedProcedure').setValue(null);
    this.selectedProcedure = procedure;
  }

  dateEndRegistrationFinished(): boolean {
    return moment(this.selectedProcedure?.dateEndRegistration).isBefore();
  }

  dateSummingUpFinished(): boolean {
    return moment(this.selectedProcedure?.dateSummingUp).isBefore();
  }

  procedureIsFinished(): boolean {
    return this.dateEndRegistrationFinished() && this.dateSummingUpFinished();
  }

  procedureIsRetrade(): boolean {
    return this.selectedProcedure?.isRetrade;
  }

  canRetradeProcedure(): boolean {
    return this.selectedProcedure?.canRetrade;
  }

  canImportProcedures() {
    return this.dateEndRegistrationFinished() &&
           moment().isAfter(moment(this.selectedProcedure?.dateEndRegistration).add(5, 'minutes')) &&
           moment().isBefore(moment(this.selectedProcedure?.dateEndRegistration).add(30, 'minutes')) &&
           !this.selectedProcedure?.offersImported &&
           !this.dateSummingUpFinished();
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isProcedureMayBeAssigned() {
    return this.selectedProcedure &&
      (this.selectedProcedure.isCanceled || !this.dateEndRegistrationFinished() || this.dateSummingUpFinished());
  }

  // Меняем ответственного
  changeResponsibleUser({user}) {
    const activeFilters = this.filterForm?.value;
    this.positionsService.changeResponsibleUser(user.id, [], [], false, activeFilters, this.selectedProcedure.procedureId)
      .subscribe(() => {
        this.store.dispatch(new ToastActions.Success(`Позиции в процедуре назначены`));
      }, () => {
        this.store.dispatch(new ToastActions.Error(`Не удалось назначить позиции в процедуре`));
      });
  }
}
