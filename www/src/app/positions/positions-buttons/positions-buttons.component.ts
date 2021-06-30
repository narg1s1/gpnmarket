import { UxgFilterDirective } from './../../../../projects/uxg/src/modules/filter/uxg-filter.directive';
import { APP_CONFIG, GpnmarketConfigInterface } from "src/app/core/config/gpnmarket-config.interface";
import { ApplicationRef, Inject } from '@angular/core';
import { RequestGroup } from './../../request/common/models/request-group';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { takeUntil } from 'rxjs/operators';
import { PositionStatus } from './../../request/common/enum/position-status';
import { PositionStatusesLabels } from './../../request/common/dictionaries/position-statuses-labels';
import { IPositionsFilters, IAvailablePositionsFilters, IPositionsSort } from './../positions-filter';
import { PermissionType } from './../../auth/enum/permission-type';
import { FormGroup } from '@angular/forms';
import { UserInfoService } from './../../user/service/user-info.service';
import { Store } from '@ngxs/store';
import { FeatureService } from './../../core/services/feature.service';
import { RequestPosition } from './../../request/common/models/request-position';
import { Observable } from 'rxjs';
import { PositionsListActions, PositionsListState } from './../positions.state';
import { Select } from '@ngxs/store';
import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { RequestActions } from "src/app/request/back-office/actions/request.actions";
import { ToastActions } from 'src/app/shared/actions/toast.actions';

@Component({
  selector: 'app-positions-buttons',
  templateUrl: './positions-buttons.component.html',
  styleUrls: ['./positions-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsButtonsComponent extends OnDestroyDirective implements OnInit, AfterViewInit {

  @Select(PositionsListState.availableFilters) availableFilters$: Observable<IAvailablePositionsFilters>;
  @Select(PositionsListState.checkedPositions) checkedPositions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.checkedGroups) checkedGroups$: Observable<RequestPosition[]>;
  @Select(PositionsListState.positions) positions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.uncheckedPositions) uncheckedPositions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.draftPositions) draftPositions$: Observable<RequestPosition[]>;
  @Select(PositionsListState.availableGroups) availableGroups$: Observable<RequestGroup[]>;
  @Select(PositionsListState.isCanChangeStatus) isCanChangeStatus$: Observable<boolean>;
  @Select(PositionsListState.someOfPositionsAreInProcedure) someOfPositionsAreInProcedure$: Observable<boolean>;
  @Select(PositionsListState.hasPositionWithProcedure) hasPositionWithProcedure$: Observable<boolean>;
  @Select(PositionsListState.allPositionsIsNew) allPositionsIsNew$: Observable<boolean>;
  @Select(PositionsListState.allPositionsIsTCPP) allPositionsIsTCPP$: Observable<boolean>;
  @Select(PositionsListState.allPositionsOnPageAreDisabled) allPositionsOnPageAreDisabled$: Observable<boolean>;
  @Select(PositionsListState.allCheckedPositionsInTheSameStatus) allCheckedPositionsInTheSameStatus$: Observable<boolean>;
  @Select(PositionsListState.totalCount) totalCount$: Observable<number>;
  @Select(PositionsListState.totalCountWithoutNotRelevantAndCanceled) totalCountWithoutNotRelevantAndCanceled$: Observable<number>;

  @Input() filterForm: FormGroup;
  @Input() mainCheckbox = false;
  @Input() useAllPositions = false;
  @Input() currentPageSize: number;
  @Input() uxgFilter: UxgFilterDirective;

  @Output() mainCheckboxChanged = new EventEmitter();
  @Output() useAllPositionsChanged = new EventEmitter();
  @Output() showAddGroupModal = new EventEmitter();
  @Output() showMoveGroupModal = new EventEmitter();
  @Output() showChangeStatusModal = new EventEmitter();
  @Output() showUploadFileModal = new EventEmitter();
  @Output() showAddResponsiblePositionModal = new EventEmitter();
  @Output() showCancelPositionModal = new EventEmitter();
  @Output() showDisbandGroupModal = new EventEmitter();
  @Output() showAddPositionModal = new EventEmitter();
  @Output() showProcedureCreationModal = new EventEmitter();
  @Output() showReturnToWorkModal = new EventEmitter();

  public PermissionType = PermissionType;
  public PositionStatusesLabels = PositionStatusesLabels;

  constructor(
    public featureService: FeatureService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    public user: UserInfoService,
    @Inject(APP_CONFIG) public appConfig: GpnmarketConfigInterface,
  ) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(new PositionsListActions.FetchAvailableFilters());

    this.checkedPositions$.pipe(takeUntil(this.destroy$)).subscribe((positions: RequestPosition[]) => {
      this.mainCheckbox = !!positions?.length;
      setTimeout(_ => {
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  selectPositions(type: "all" | "none" | "groups" | "positions") {
    if (["all", "none"].indexOf(type) >= 0) {
      this.mainCheckbox = type === "all";
      this.selectAllPositions(type === "all");
    }
    if (["groups", "positions"].indexOf(type) >= 0) {
      this.mainCheckbox = true;
      if (type === 'groups') {
        this.store.dispatch(new PositionsListActions.SelectOnlyGroups());
      }
      if (type === 'positions') {
        this.store.dispatch(new PositionsListActions.SelectOnlyPositions());
      }
    }
    this.cdr.detectChanges();
  }

  selectAllPositions(event: boolean) {
    this.store.dispatch(new PositionsListActions.SelectAllPositions(event))
      .subscribe(_ => {
        this.cdr.detectChanges();
      });
  }

  onApprove(positions) {
    this.store.dispatch(
      new RequestActions.Publish(null, true, positions.map(position => position.id))
    ).subscribe(() => {
      this.store.dispatch(new ToastActions.Success(`Позиции отправлены на согласование`));
    }, () => {
      this.store.dispatch(new ToastActions.Success(`Не удалось отправить позиции на согласование`));
    });
  }

  public isCheckedPositionsInTheSameProcedure(positions: RequestPosition[]): boolean {
    return positions.every(pos => pos.procedureUuid && pos.procedureUuid === positions[0].procedureUuid && pos.status !== PositionStatus.NEW);
  }

  public isCheckedPositionsInTheSameTCPGroup(positions: RequestPosition[]): boolean {
    return positions.every(pos => !pos.procedureUuid && pos.tcpGroupId && pos.tcpGroupId === positions[0].tcpGroupId);
  }

  public hasPositionWithProcedure(positions: RequestPosition[]): boolean {
    return positions.some(pos => pos.procedureId);
  }

  public toggleGroups(folded: boolean) {
    this.store.dispatch(new PositionsListActions.ToggleGroups(folded))
      .subscribe(_ => {
        this.cdr.detectChanges();
      });
  }

  public isCreateProcedureDisabled() {
    const isCheckedPositionsExist = !!this.store.selectSnapshot(PositionsListState.checkedPositions)?.length;
    const isTotalCountPositionsOverflow = this.store.selectSnapshot(PositionsListState.totalCountWithoutNotRelevantAndCanceled) > this.appConfig.procedure.maxPositionsForCreateProcedure;
    const isSelectedPositionsNotNew = !this.store.selectSnapshot(PositionsListState.allPositionsIsNew);

    return !isCheckedPositionsExist
      || (this.useAllPositions && (isTotalCountPositionsOverflow || this.isFilteredPositionsInStatusNotNew() || this.isProcedureFiltersActivated()))
      || (!this.useAllPositions && isSelectedPositionsNotNew);
  }

  public isFilteredPositionsInStatusNotNew() {
    const positionStatusesFilter = this.filterForm.value?.positionStatuses || [];
    return  positionStatusesFilter.length > 1 || (positionStatusesFilter.length === 1 && positionStatusesFilter[0] !== PositionStatus.NEW);
  }

  public isProcedureFiltersActivated() {
    const filters = this.filterForm.value;
    return filters.procedureEndRegistrationDateFrom
        || filters.procedureEndRegistrationDateTo
        || filters.procedureRegistryNumbers?.length
        || filters.procedureId;
  }

}
