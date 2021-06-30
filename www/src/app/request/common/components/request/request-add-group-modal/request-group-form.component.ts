import { PositionsService } from './../../../../../positions/positions.service';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { finalize, flatMap } from "rxjs/operators";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RequestPositionService } from "../../../services/request-position.service";
import { GroupWithPositions } from "../../../models/groupWithPositions";
import { Request } from "../../../models/request";
import { RequestPosition } from "../../../models/request-position";
import { Subscription } from "rxjs";
import { RequestFilters } from "../../../models/request-filters";

@Component({
  selector: 'app-request-group-form',
  templateUrl: 'request-group-form.component.html'
})
export class RequestGroupFormComponent implements OnDestroy {
  @Input() positions: RequestPosition[] = [];
  @Input() request: Request;
  @Input() useAllPositions: boolean;
  @Input() activeFilters: RequestFilters;
  @Output() success = new EventEmitter();
  @Output() close = new EventEmitter();
  subscription = new Subscription();
  isLoading: boolean;

  form = new FormGroup({
    name: new FormControl("", Validators.required)
  });

  constructor(private positionService: RequestPositionService, private positionListService: PositionsService) {}

  submit() {
    if (!this.form.valid) { return; }

    this.isLoading = true;
    const groupName = this.form.get('name').value;
    if (this.request) {
      this.subscription.add(
        this.positionService.saveGroup(this.request.id, groupName).pipe(
          flatMap(requestGroup => this.positionService.addPositionsInGroup(
            this.request.id,
            requestGroup.id,
            this.positions.map(position => position.id),
            this.useAllPositions,
            this.activeFilters
          )),
          finalize(() => {
            this.isLoading = false;
            this.form.reset();
            this.close.emit();
          })
        ).subscribe(groupWithPositions => this.success.emit(groupWithPositions))
      );
    } else {
      this.subscription.add(
        this.positionListService
          .addGroup(groupName, this.positions, this.activeFilters, this.useAllPositions)
          .pipe(
            finalize(() => {
              this.isLoading = false;
              this.form.reset();
              this.close.emit();
            })
          )
          .subscribe(() => {
            this.success.emit();
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
