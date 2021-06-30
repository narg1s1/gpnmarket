import { debounceTime } from 'rxjs/operators';
import { catchError, shareReplay, switchMap} from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Uuid } from './../../../../../cart/models/uuid';
import { RequestService } from './../../../../back-office/services/request.service';
import { ContragentList } from 'src/app/contragent/models/contragent-list';
import { ContragentService } from './../../../../../contragent/services/contragent.service';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Request } from "../../../models/request";
import { RequestPosition } from "../../../models/request-position";
import { Observable, throwError } from "rxjs";
import { UxgModalComponent } from "uxg";
import { searchContragents } from 'src/app/shared/helpers/search';

@Component({
  selector: 'app-request-add-position-modal',
  templateUrl: './request-add-position-modal.component.html',
  styleUrls: ['./request-add-position-modal.component.scss'],
})
export class RequestAddPositionModalComponent extends OnDestroyDirective implements OnInit, AfterViewInit, OnDestroy {

  constructor(private contragentService: ContragentService, private requestService: RequestService, private cdr: ChangeDetectorRef) {
    super();
  }
  @ViewChild(UxgModalComponent) modal: UxgModalComponent;

  @Input() request: Request = null;
  @Input() onDrafted: (position: RequestPosition) => Observable<RequestPosition>;
  @Input() isShowDocumentsBlock?: boolean;

  @Output() success = new EventEmitter();
  @Output() uploadFromTemplate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() onRequestSelected = new EventEmitter<Request>();

  public firstStepForm = new FormGroup({
    contragent: new FormControl(null, [Validators.required]),
    request: new FormControl(null, [Validators.required]),
  });

  errorInput = '';
  public contragents$: Observable<ContragentList[]>;
  public requestList$: Observable<Request[]>;

  readonly searchContragents = searchContragents;
  public searchRequestFn = (query: string, items: Request[]) => {
    return query
      ? items.filter(request => request.name.toLowerCase().includes(query?.toLowerCase()))
      : items;
  }

  ngOnInit(): void {
    if (!this.request) {
      this.contragents$ = this.contragentService.getContragentList(true).pipe(
        catchError(err => {
          return throwError(err);
        })
      );
    this.firstStepForm.get('contragent')
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((contragentId: ContragentList) => {
        if (!contragentId) {
          return;
        }
        this.firstStepForm.get('request').setValue(null);
        this.requestList$ = this.requestService.getRequestListByContragent(contragentId.id).pipe(
          catchError(err => {
            return throwError(err);
          })
        );
      });
    }
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.firstStepForm?.reset();
  }

  onModalStateChange(isOpen: boolean) {
    if (!isOpen) {
      this.firstStepForm?.reset();
    }
  }

  onContragentSelect(contragent: {label: string, value: ContragentList}) {
    this.requestService.getRequestListByContragent(contragent.value?.id).subscribe(
      data => {
        if (data.length === 0) {
          this.errorInput = 'У выбранного контрагента нет активных заявок.';
          this.firstStepForm.controls['request'].disable();
        } else {
          this.errorInput = '';
          this.firstStepForm.controls['request'].enable();
        }
        this.cdr.detectChanges();
      });
  }

  open() {
    this.modal.open();
  }

  close() {
    this.firstStepForm?.reset();
    this.modal.close();
  }

  displaySuggestName({name}) { return name; }

  getContragentName = (contragent: ContragentList) => contragent.shortName || contragent.fullName;

}
