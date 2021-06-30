import { PositionsService } from './../../../../../positions/positions.service';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { finalize } from "rxjs/operators";
import { FormControl, FormGroup } from "@angular/forms";
import { GroupWithPositions } from "../../../models/groupWithPositions";
import { Request } from "../../../models/request";
import { RequestPosition } from "../../../models/request-position";
import { Subscription, Observable } from "rxjs";
import { RequestGroup } from "../../../models/request-group";
import { RequestPositionService } from "../../../services/request-position.service";
import { RequestFilters } from "../../../models/request-filters";

@Component({
  selector: 'app-request-move-group-modal',
  templateUrl: 'request-move-group-modal.component.html'
})
export class RequestMoveGroupModalComponent implements OnDestroy {
  @Input() positions: RequestPosition[] = [];
  @Input() groups: RequestGroup[] = [];
  @Input() groups$?: Observable<RequestGroup[]>;
  @Input() request: Request;
  @Input() useAllPositions: boolean;
  @Input() activeFilters: RequestFilters;
  @Output() success = new EventEmitter<GroupWithPositions>();
  @Output() close = new EventEmitter();
  subscription = new Subscription();
  isLoading: boolean;

  form = new FormGroup({
    group: new FormControl(null, c => c.value === null ? { "error": true } : null)
  });

  constructor(private positionService: RequestPositionService, private positionListService: PositionsService) {}

  submit() {
    this.isLoading = true;

    if (this.request) {
      this.subscription.add(
        this.positionService.addPositionsInGroup(
          this.request.id,
          this.form.get('group').value.id,
          this.positions.map(position => position.id),
          this.useAllPositions,
          this.activeFilters
        ).pipe(
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
          .moveToGroup(this.form.get('group').value.id, this.positions, this.activeFilters, this.useAllPositions)
          .pipe(
            finalize(() => {
              this.isLoading = false;
              this.form.reset();
              this.close.emit();
            })
          )
          .subscribe(_ => this.success.emit())
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public searchGroups = (query: string, groups: Request[]) => {
    return query
      ? groups.filter(group => group.name.toLowerCase().includes(query?.toLowerCase()))
      : groups;
  }

  public getGroupName = ({ name }) => name;
}
