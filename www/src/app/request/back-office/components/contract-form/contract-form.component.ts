import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { ContragentWithPositions } from "../../../common/models/contragentWithPositions";
import { Request } from "../../../common/models/request";
import { FormBuilder, Validators } from "@angular/forms";
import { RequestPosition } from "../../../common/models/request-position";
import { Store } from "@ngxs/store";
import { ContractActions } from "../../actions/contract.actions";
import { map, takeUntil } from "rxjs/operators";
import { Observable, Subject } from "rxjs";
import Create = ContractActions.Create;

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss']
})
export class ContractFormComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() suppliers: ContragentWithPositions[] = [];
  @Input() request: Request;
  @Output() close = new EventEmitter<void>();
  @Output() filterPositions = new EventEmitter();

  readonly form = this.fb.group({
    contragentId: null,
    positions: [null, [Validators.minLength(1), Validators.required]],
    useAllPositions: false
  });
  readonly destroy$ = new Subject();
  readonly positions$: Observable<RequestPosition[]> = this.form.get('contragentId').valueChanges.pipe(
    map(contragentId => this.suppliers?.find(({ supplier }) => supplier.id === contragentId)?.positions),
  );

  constructor(public store: Store, private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnChanges() {
    this.form.get('contragentId').updateValueAndValidity();
  }

  ngOnInit() {
    this.form.get('useAllPositions').valueChanges.subscribe(useAllPositions => {
      const c = this.form.get('positions');
      if (useAllPositions) {
        c.setValidators(null);
        c.disable();
      } else {
        c.setValidators([Validators.minLength(1), Validators.required]);
        c.enable();
      }
    });
  }

  ngAfterViewInit() {
    if (this.suppliers) {
      this.form.get('contragentId').setValue(this.suppliers[0]?.supplier.id);
    }
    this.cd.detectChanges();
  }

  public submit(): void {
    const { contragentId, positions, useAllPositions } = this.form.value;
    this.store.dispatch(new Create(this.request.id, contragentId, positions, useAllPositions)).pipe(takeUntil(this.destroy$));
    this.close.emit();
  }

  trackById = (item: RequestPosition) => item.id;
}
