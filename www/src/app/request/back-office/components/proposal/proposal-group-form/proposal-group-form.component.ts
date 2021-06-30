import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { RequestPosition } from "../../../../common/models/request-position";
import { UxgModalComponent } from "uxg";
import { Subject } from "rxjs";
import { ProposalGroup } from "../../../../common/models/proposal-group";
import { FormBuilder, Validators } from "@angular/forms";
import { Uuid } from "../../../../../cart/models/uuid";
import { searchPosition } from "../../../../../shared/helpers/search";

@Component({
  selector: 'app-common-proposal-group-form',
  templateUrl: './proposal-group-form.component.html',
  styleUrls: ['./proposal-group-form.component.scss']
})
export class ProposalGroupFormComponent implements OnChanges, OnDestroy, OnInit {
  @ViewChild('createGroup') createGroup: UxgModalComponent;
  @Output() complete = new EventEmitter();
  @Output() create = new EventEmitter<{ name: string, id?: Uuid, requestPositions: Uuid[] }>();
  @Output() filterAvailablePositions = new EventEmitter();
  @Input() availablePositions: RequestPosition[];
  @Input() requestId: Uuid;
  @Input() group: ProposalGroup;
  @Input() sourceLabel = 'ТКП';
  isLoading = false;
  readonly searchPosition = searchPosition;
  readonly destroy$ = new Subject();
  mergeWithExistPositions: (RequestPosition | ProposalGroup['requestPositions'][number])[];

  readonly form = this.fb.group({
    name: [null, Validators.required],
    requestPositions: [null, [Validators.minLength(1), Validators.required]],
    useAllPositions: false
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.get('useAllPositions').valueChanges.subscribe(useAllPositions => {
      const c = this.form.get('requestPositions');
      if (useAllPositions) {
        c.setValidators(null);
        c.disable();
      } else {
        c.setValidators([Validators.minLength(1), Validators.required]);
        c.enable();
      }
    });
  }

  ngOnChanges() {
    this.form.patchValue(this.group ?? {});

    this.mergeWithExistPositions = (this.group?.requestPositions ?? [])
      .filter(groupPosition => this.availablePositions?.every(({ id }) => groupPosition.id !== id))
      .reduce((arr, curr) => [curr, ...arr], this.availablePositions);
  }

  submit() {
    if (this.form.invalid) { return; }

    this.create.emit({
      ...this.form.value,
      id: this.group?.id,
      requestPositions: this.form.value.requestPositions?.map(({ id }) => id)
    });

    this.complete.emit();
  }

  trackById = (item: RequestPosition) => item.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
