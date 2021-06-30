import { RequestGroup } from './../request/common/models/request-group';
import { getFlatPositions } from './positions-helpers';
import { PositionStatus } from './../request/common/enum/position-status';
import { RequestPosition } from './../request/common/models/request-position';
import { Page } from './../core/models/page';
import { PositionsService } from './positions.service';
import { IPositionsFilters, IPositionsSort } from './positions-filter';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { patch, updateItem } from "@ngxs/store/operators";

export namespace PositionsListActions {
  export class Fetch {
    static readonly type = '[Positions List Backoffice] Fetch';
    constructor(public startFrom: number, public pageSize: number, public filters: IPositionsFilters = {}, public sort: IPositionsSort = {}) {}
  }
  export class FetchAvailableFilters {
    static readonly type = '[Positions List Backoffice] Fetch Available Filters';
  }
  export class FetchAvailableGroups {
    static readonly type = '[Positions List Backoffice] Fetch Available Groups';
  }
  export class SelectAllPositions {
    static readonly type = '[Positions List Backoffice] Select all positions';
    constructor(public checkOrUncheck: boolean) {}
  }

  export class ToggleGroups {
    static readonly type = '[Positions List Backoffice] Toggle groups';
    constructor(public folded: boolean) {}
  }

  export class SelectOnlyGroups {
    static readonly type = '[Positions List Backoffice] Select only groups';
  }

  export class SelectOnlyPositions {
    static readonly type = '[Positions List Backoffice] Select only positions';
  }

  export class SelectPosition {
    static readonly type = '[Positions List Backoffice] Select only one position';
    constructor(public position: RequestPosition) {}
  }

  export class SelectGroupPosition {
    static readonly type = '[Positions List Backoffice] Select group position';
    constructor(public group: RequestPosition) {}
  }
}


export interface PositionsStateModel {
  positions: RequestPosition[];
  checkedPositions: RequestPosition[];
  checkedGroups: RequestPosition[];
  availableGroups: RequestGroup[];
  totalCount: number;
  totalCountWithoutNotRelevantAndCanceled: number;
  isWithoutStartPrice: boolean;
  availableFilters: IPositionsFilters;
  status: string;
}

type Context = StateContext<PositionsStateModel>;

@State<PositionsStateModel>({
  name: 'PositionsList',
  defaults: {
    positions: null,
    checkedPositions: [],
    checkedGroups: [],
    availableGroups: [],
    totalCount: 0,
    totalCountWithoutNotRelevantAndCanceled: 0,
    isWithoutStartPrice: null,
    availableFilters: null,
    status: "pristine"
  }
})
@Injectable()
export class PositionsListState {

  static isPositionDisabled = (pos: RequestPosition) => {
    return pos.inQueue
        || pos.status === PositionStatus.CANCELED || pos.status === PositionStatus.NOT_RELEVANT
        || pos.positions?.every((p: RequestPosition) => PositionsListState.isPositionDisabled(p));
  }

  constructor(private rest: PositionsService) {}

  @Selector() static positions({positions}: PositionsStateModel) { return positions; }
  @Selector() static checkedPositions({checkedPositions}: PositionsStateModel) { return checkedPositions; }
  @Selector() static checkedGroups({checkedGroups}: PositionsStateModel) { return checkedGroups; }
  @Selector() static uncheckedPositions({positions}: PositionsStateModel) {
    return positions.filter(pos => !pos._selected || pos.positions?.some(p => !p._selected));
  }
  @Selector() static draftPositions({checkedPositions}: PositionsStateModel) {
    return checkedPositions.filter(pos => pos.status === PositionStatus.DRAFT);
  }
  @Selector() static allPositionsIsNew({checkedPositions}: PositionsStateModel) {
    return checkedPositions.every(pos => pos.status === PositionStatus.NEW);
  }
  @Selector() static allPositionsIsTCPP({checkedPositions}: PositionsStateModel) {
    return checkedPositions.every(pos => pos.status === PositionStatus.TECHNICAL_COMMERCIAL_PROPOSALS_PREPARATION);
  }
  @Selector() static disabledPositionsOnPage({positions}: PositionsStateModel) {
    return getFlatPositions(positions).filter(p => PositionsListState.isPositionDisabled(p));
  }
  @Selector() static allPositionsOnPageAreDisabled({positions}: PositionsStateModel) {
    return getFlatPositions(positions).every(p => PositionsListState.isPositionDisabled(p));
  }
  @Selector() static availableGroups({availableGroups}: PositionsStateModel) { return availableGroups; }
  @Selector() static isCanChangeStatus({checkedPositions}: PositionsStateModel) {
    return checkedPositions.every(pos => pos.status === checkedPositions[0].status);
  }
  @Selector() static everyPositionIsNotDraftEntity({checkedPositions}: PositionsStateModel) {
    return checkedPositions.every(pos => pos.status !== PositionStatus.DRAFT);
  }
  @Selector() static someOfPositionsAreInProcedure({checkedPositions}: PositionsStateModel) {
    return checkedPositions.some(pos => pos.isInProcedure === true);
  }
  @Selector() static hasPositionWithProcedure({checkedPositions}: PositionsStateModel) {
    return checkedPositions.some(pos => pos.procedureId);
  }
  @Selector() static totalCount({totalCount}: PositionsStateModel) { return totalCount; }
  @Selector() static totalCountWithoutNotRelevantAndCanceled({totalCountWithoutNotRelevantAndCanceled}: PositionsStateModel) {
    return totalCountWithoutNotRelevantAndCanceled;
  }
  @Selector() static isWithoutStartPrice({isWithoutStartPrice}: PositionsStateModel) { return isWithoutStartPrice; }
  @Selector() static status({status}: PositionsStateModel) { return status; }
  @Selector() static availableFilters({availableFilters}: PositionsStateModel) { return availableFilters; }
  @Selector() static allCheckedPositionsInTheSameStatus({checkedPositions}: PositionsStateModel) {
    return checkedPositions.every(position => position.status === checkedPositions[0].status);
  }

  // Получение всех позиций
  @Action(PositionsListActions.Fetch) fetch({setState, getState}: Context, {startFrom, pageSize, filters, sort}: PositionsListActions.Fetch) {

    setState(patch({ status: "fetching" }));

    return this.rest.getAllPositions(startFrom, pageSize, filters, sort).pipe(
      tap((data: Page<RequestPosition>) => {
        const positions = data.result;
        const checkedPositions = getState().checkedPositions;
        const checkedGroups = getState().checkedGroups;
        // Отмечаем уже выбранные позиции при переходам по страницам
        positions.forEach((position: RequestPosition) => {
          const checkedPosition = checkedPositions.find(pos => pos.id === position.id);
          position._disabled = PositionsListState.isPositionDisabled(position);
          position._selected = !!checkedPosition && !position._disabled;
          position.positions?.forEach((childPosition: RequestPosition) => {
            const checkedChildPosition = checkedPositions.find(pos => pos.id === childPosition.id);
            const positionExistInSelectedGroup = checkedGroups.find(group => group.id === childPosition.groupId);
            childPosition._disabled = PositionsListState.isPositionDisabled(childPosition);
            childPosition._selected = (!!checkedChildPosition || !!positionExistInSelectedGroup) && !childPosition._disabled;
          });
          if (position.entityType === 'GROUP') {
            position._selected = position.positions.some(pos => pos._selected);
          }
        });
        setState(patch({
          positions: [...positions],
          totalCount: data.totalCount,
          totalCountWithoutNotRelevantAndCanceled: data.totalCountWithoutNotRelevantAndCanceled,
          isWithoutStartPrice: data.isWithoutStartPrice,
          status: "received"
        }));
      }),
    );
  }

  // Получение доступных фильтров на странице
  @Action(PositionsListActions.FetchAvailableFilters) fetchFilters({setState}: Context) {
    return this.rest.getAvailableFilters().pipe(tap(filters => setState(patch({availableFilters: filters}))));
  }

  // Получение списка групп для переноса позиций
  @Action(PositionsListActions.FetchAvailableGroups) fetchGroups({setState}: Context) {
    return this.rest.getAvailableGroups().pipe(tap(groups => setState(patch({
      // Отфильтровываем группы без имени
      availableGroups: groups.filter(group => !!group.name)
    }))));
  }

  // Выбор всех позиций на странице
  @Action(PositionsListActions.SelectAllPositions)
  selectAllPositions({setState, getState}: Context, {checkOrUncheck}: PositionsListActions.SelectAllPositions) {
    const checkedPositions = getState().positions.map((pos: RequestPosition) => {
      pos._selected = checkOrUncheck && !pos._disabled;
      pos.positions?.forEach(p => {
        p._selected = checkOrUncheck && !p._disabled;
      });
      return pos;
    });
    const flatCheckedPositions = getFlatPositions(checkedPositions);
    setState(patch({
      checkedPositions: checkOrUncheck ? flatCheckedPositions.filter(pos => pos._selected) : [],
      positions: checkedPositions
    }));
  }

  // Выбор только групп на странице
  @Action(PositionsListActions.SelectOnlyGroups)
  selectOnlyGroups({setState, getState}: Context) {
    const checkedGroups = getState().positions.map((pos: RequestPosition) => {
      pos._selected = pos.entityType === 'GROUP' && !pos._disabled;
      pos.positions?.forEach(p => {
        p._selected = pos.entityType === 'GROUP' && !p._disabled && !pos._disabled;
      });
      return pos;
    });
    const flatCheckedPositions = getFlatPositions(checkedGroups);
    setState(patch({
      checkedPositions: flatCheckedPositions.filter(pos => pos._selected),
      positions: checkedGroups
    }));
  }

  // Выбор только позиций вне групп на странице
  @Action(PositionsListActions.SelectOnlyPositions)
  selectOnlyPositions({setState, getState}: Context) {
    const checkedPositions = getState().positions.map((pos: RequestPosition) => {
      pos._selected = pos.entityType !== 'GROUP' && !pos._disabled;
      pos.positions?.forEach(p => {
        p._selected = pos.entityType !== 'GROUP' && !pos._disabled;
      });
      return pos;
    });
    setState(patch({
      checkedPositions: checkedPositions.filter(pos => pos.entityType !== 'GROUP' && pos._selected),
      positions: checkedPositions
    }));
  }

  // Выбор одной позиции или позиций внутри группы
  @Action(PositionsListActions.SelectPosition)
  selectPosition({setState, getState}: Context, {position}: PositionsListActions.SelectPosition) {
    setState(patch({
      positions: updateItem((pos) => pos.id === position.id, position)
    }));
    const checkedPositions = getState().checkedPositions.filter(pos => pos.id !== position.id);
    if (position._selected) {
      setState(patch({
        checkedPositions: [...checkedPositions, position]
      }));
    } else {
      setState(patch({
        checkedPositions: [...checkedPositions],
      }));
    }
  }

  // Выбор группы
  @Action(PositionsListActions.SelectGroupPosition)
  selectGroupPosition({setState, getState}: Context, {group}: PositionsListActions.SelectGroupPosition) {
    const checkedGroups = getState().checkedGroups.filter(g => g.id !== group.id);
    const positionsNotInCurrentGroup = getState().checkedPositions.filter(pos => pos.groupId !== group.id);
    if (group._selected) {
      setState(patch({
        checkedGroups: [...checkedGroups, group],
        checkedPositions: group._preventUpdatePositions ? getState().checkedPositions : [...positionsNotInCurrentGroup, ...group.positions.filter(pos => !pos._disabled)]
      }));
    } else {
      setState(patch({
        checkedGroups: [...checkedGroups],
        checkedPositions: group._preventUpdatePositions ? getState().checkedPositions : [...positionsNotInCurrentGroup]
      }));
    }
  }

  // Скрыть/Показать позиции внутри группы
  @Action(PositionsListActions.ToggleGroups)
  toggleGroups({setState, getState}: Context, {folded}: PositionsListActions.ToggleGroups) {
    setState(patch({
      positions: getState().positions.map(position => {
        if (position.entityType === 'GROUP') {
          return { ...position, _folded: folded };
        }
        return position;
      })
    }));
  }
}
