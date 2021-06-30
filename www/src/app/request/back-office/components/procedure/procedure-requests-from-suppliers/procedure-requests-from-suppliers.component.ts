import { RequestFromSupplierStatuses } from './../../../../common/models/requests-list/request-from-supplier';
import { takeUntil } from 'rxjs/operators';
import { first, map } from 'rxjs/operators';
import { APP_CONFIG, GpnmarketConfigInterface } from './../../../../../core/config/gpnmarket-config.interface';
import { switchMap } from 'rxjs/operators';
import { ProceduresRequestsFilter } from './../../../models/procedures-filter';
import { ActivatedRoute } from '@angular/router';
import { scan } from 'rxjs/operators';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { Store } from '@ngxs/store';
import { IProcedureRequestFromSupplier } from '../../../../common/models/requests-list/request-from-supplier';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, Input, Inject, ChangeDetectionStrategy, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { RequestFromSuppliersActions } from '../../../actions/requests-from-suppliers.actions';
import { RequestsFromSuppliersState } from '../../../states/procedure-requests-from-suppliers.state';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { ToastActions } from 'src/app/shared/actions/toast.actions';

@Component({
  selector: 'app-requests-from-suppliers',
  templateUrl: './procedure-requests-from-suppliers.component.html',
  styleUrls: ['./procedure-requests-from-suppliers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsFromSuppliersComponent extends OnDestroyDirective implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Select(RequestsFromSuppliersState.requestsFromSuppliers) requestsFromSuppliers$: Observable<IProcedureRequestFromSupplier[]>;
  @Select(RequestsFromSuppliersState.totalRequestsCount) totalRequests$: Observable<number>;

  @Input() requestsFiltersSubject$: Subject<{ page?: number, pageSize?: number, filters?: ProceduresRequestsFilter }>;
  @Output() requestsRecieved = new EventEmitter();

  public isAnswerSending = false;
  public notAnswered = false;
  public RequestFromSupplierStatuses = RequestFromSupplierStatuses;

  readonly pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
  readonly pageSize = this.appConfig.paginator.pageSize;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
  ) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(new RequestFromSuppliersActions.Fetch(1, this.pageSize, null))
      .pipe(first())
      .subscribe((response) => {
        this.requestsRecieved.emit(response.BackofficeRequestsFromSuppliers);
      });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.requestsFiltersSubject$?.firstChange && this.requestsFiltersSubject$) {
      this.subscribeOnFilters();
    }
  }

  // Подписка на фильтры и пагинацию
  private subscribeOnFilters() {
    this.requestsFiltersSubject$.pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      tap(({ page }) => {
        if (!page) { this.router.navigate(["requests"], { relativeTo: this.route, queryParams: null }); }
      }),
      scan(({ filters: prev }, { page = 1, filters: curr }) => {
        const filters = { ...prev, ...curr };
        return ({ page, filters });
      }, {} as { page?: number, filters?: ProceduresRequestsFilter }),
      switchMap(data => {
        const payload = {
          startFrom: data.page === 1 ? data.page : (data.page - 1) * this.pageSize,
          pageSize: this.pageSize,
          filters: data.filters as ProceduresRequestsFilter
        };
        return this.store.dispatch(new RequestFromSuppliersActions.Fetch(payload.startFrom, payload.pageSize, payload.filters));
      }),
    ).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  onPageIndexChanged(index: number) {
    this.requestsFiltersSubject$.next({page: index});
  }

  onSelectDocument(event: {files: File[]}, request: IProcedureRequestFromSupplier) {
    this.store.dispatch(new RequestFromSuppliersActions.AttachDocuments(request, event.files));
  }

  sendAnswer(procedureRequest: IProcedureRequestFromSupplier) {
    this.isAnswerSending = true;
    this.store.dispatch(new RequestFromSuppliersActions.SendAnswer(procedureRequest.id, procedureRequest.answer, procedureRequest.answerDocuments))
      .subscribe(() => {
        this.isAnswerSending = false;
        this.cdr.detectChanges();
      }, () => {
        this.isAnswerSending = false;
        this.cdr.detectChanges();
        this.store.dispatch(new ToastActions.Error("Произошла ошибка при отправке ответа!"));
      });
  }

  trackByFn(index: number, request: IProcedureRequestFromSupplier) {
    return request?.id || index;
  }
}
