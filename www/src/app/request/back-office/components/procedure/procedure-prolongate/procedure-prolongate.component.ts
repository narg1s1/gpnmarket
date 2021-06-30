import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { ToastActions } from "../../../../../shared/actions/toast.actions";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Uuid } from "../../../../../cart/models/uuid";
import * as moment from "moment";
import { Moment } from "moment";
import { catchError, finalize, takeUntil, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";
import { CustomValidators } from "../../../../../shared/forms/custom.validators";
import { ProcedureService } from "../../../services/procedure.service";
import { ProposalSource } from "../../../enum/proposal-source";

@Component({
  selector: 'app-procedure-prolongate',
  templateUrl: './procedure-prolongate.component.html'
})
export class ProcedureProlongateComponent implements OnChanges, OnDestroy {

  @ViewChild('dateEndRegistrationRef') dateEndRegistrationRef: ElementRef;
  @ViewChild('dateSummingUpRef') dateSummingUpRef: ElementRef;

  @Input() requestId: Uuid;
  @Input() procedureId: string;
  @Input() dateEndRegistration: string;
  @Input() dateSummingUp: string;
  @Input() proposalSource: ProposalSource;
  @Output() close = new EventEmitter();
  @Output() complete = new EventEmitter();
  form: FormGroup;
  parsedDateEndRegistration: Moment;
  parsedDateSummingUp: Moment;
  isLoading: boolean;
  readonly destroy$ = new Subject();

  ngOnChanges() {
    this.parsedDateEndRegistration = moment(this.dateEndRegistration);
    this.parsedDateSummingUp = moment(this.dateSummingUp);

    this.form = this.fb.group({
      requestId: [this.requestId],
      procedureId: [this.procedureId, Validators.required],
      dateEndRegistration: [this.parsedDateEndRegistration.format('DD.MM.YYYY HH:mm'), [Validators.required, CustomValidators.currentOrFutureDate()]],
      dateSummingUp: [this.parsedDateSummingUp?.format('DD.MM.YYYY HH:mm'), [Validators.required]],
    });

    this.form.get("dateEndRegistration").valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(dateEndRegistration => {
        const dateSummingUp = this.form.get("dateSummingUp").value;

        if (this.form.get("dateSummingUp").value) {
          if (moment(dateEndRegistration, "DD.MM.YYYY HH:mm").isAfter(moment(dateSummingUp, "DD.MM.YYYY HH:mm"))) {
            this.form.get("dateSummingUp").setErrors({ afterEndRegistrationDate: true});
            this.dateSummingUpRef.nativeElement.classList.add('invalid');
          } else {
            this.form.get("dateSummingUp").setErrors(null);
          }
        }
      });

    this.form.get("dateSummingUp").valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(dateSummingUp => {
        const dateEndRegistration = this.form.get("dateEndRegistration").value;

        if (this.form.get("dateSummingUp").value) {
          if (moment(dateSummingUp, "DD.MM.YYYY HH:mm").isBefore(moment(dateEndRegistration, "DD.MM.YYYY HH:mm"))) {
            this.form.get("dateSummingUp").setErrors({ afterEndRegistrationDate: true});
            this.dateSummingUpRef.nativeElement.classList.add('invalid');
          } else {
            this.form.get("dateSummingUp").setErrors(null);
          }
        }
      });
  }

  constructor(
    private procedureService: ProcedureService,
    private store: Store,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
  }

  submit() {
    if (this.form.valid) {
      this.isLoading = true;

      // Значение формы обновляется после закрытия слоя с датапикером и не моментально,
      // поэтому отправить форму можем после небольшого ожидания, пока значения формы не перезапишутся
      // см. isprocessor-201
      setTimeout(() => {
        const { requestId, procedureId, dateEndRegistration, dateSummingUp } = this.form.value;
        this.procedureService.prolongateProcedureEndDate(
            this.proposalSource,
            requestId,
            this.route.snapshot.params.id,
            moment(dateEndRegistration, "DD.MM.YYYY HH:mm").toISOString(),
            moment(dateSummingUp, "DD.MM.YYYY HH:mm").toISOString(),
            procedureId
        ).pipe(
            tap(() => this.store.dispatch(new ToastActions.Success("Дата успешно изменена"))),
            tap(() => this.complete.emit()),
            catchError(err => {
              this.store.dispatch(new ToastActions.Error(err?.error?.detail ?? "Не удалось изменить дату"));
              return throwError(err);
            }),
            finalize(() => this.isLoading = false),
            takeUntil(this.destroy$),
        ).subscribe();
      }, 350);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
