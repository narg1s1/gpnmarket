import { RequestFilters } from './../request/common/models/request-filters';
import { PositionStatus } from './../request/common/enum/position-status';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RequestGroup } from './../request/common/models/request-group';
import { Uuid } from './../cart/models/uuid';
import { RequestPosition } from './../request/common/models/request-position';
import { HttpClient } from '@angular/common/http';
import { IPositionsFilters, IPositionsSort } from './positions-filter';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PositionsService {

  constructor(
    protected api: HttpClient,
  ) {}

  getAllPositions(startFrom: number = 0, pageSize: number = 50, filters: IPositionsFilters = {}, sort: IPositionsSort = {}) {
    const url = `requests/backoffice/positions/list`;
    return this.api.post(url, { startFrom, pageSize, filters, sort });
  }

  getAvailableFilters() {
    const url = `requests/backoffice/positions/listAvailableFilters`;
    return this.api.get<IPositionsFilters>(url);
  }

  getAvailableGroups() {
    const url = `requests/backoffice/positions/groups`;
    return this.api.get<any>(url);
  }

  getAvailablePositionsForCreateProcedure(filters: IPositionsFilters = {}, positions: string[], positionsGroupsIds: string[], useAllPositions: boolean): Observable<RequestPosition[]> {
    const url = 'requests/backoffice/procedures/get-available-positions';
    const filtersPayload = {...filters};
    if (!useAllPositions) {
      filtersPayload.positionsGroupsIds = positionsGroupsIds;
      filtersPayload.positions = positions;
    }
    return this.api.post<any>(url, { filters: filtersPayload, useAllPositions });
  }

  addGroup(name: string, selectedPositions: RequestPosition[], filters: IPositionsFilters, useAllPositions: boolean) {
    const url = `requests/positions-list/groups/add-group`;
    const onlyWithoutGroup = useAllPositions ? undefined : true;
    const positions = useAllPositions ? undefined : selectedPositions.map(pos => pos.id);
    return this.api.post(url, { name, filters: {...filters, positions}, useAllPositions, onlyWithoutGroup });
  }

  moveToGroup(groupId: Uuid, selectedPositions: RequestPosition[], filters: IPositionsFilters, useAllPositions: boolean) {
    const url = `requests/positions-list/groups/add-positions`;
    const onlyWithoutGroup = useAllPositions ? undefined : true;
    const positions = useAllPositions ? undefined : selectedPositions.map(pos => pos.id);
    return this.api.post(url, { groupId, filters: {...filters, positions}, useAllPositions, onlyWithoutGroup });
  }

  disbandPositionsGroup(groupId: Uuid) {
    const url = `requests/positions-list/groups/remove-group`;
    return this.api.post(url, { groupId });
  }

  changeResponsibleUser(user: Uuid, positions: Uuid[], positionsGroupsIds: Uuid[], useAllPositions: boolean, filters: IPositionsFilters = null, procedureId?: string) {
    const url = `requests/backoffice/positions/list-change-responsible-user`;
    return this.api.post(url, { user, filters: useAllPositions
      ? {...filters, procedureId: procedureId?.toString()}
      : {...filters, positions, positionsGroupsIds, procedureId: procedureId?.toString()} });
  }

  setRegistryExcelInQueue(positions: Uuid[], positionsGroupsIds: Uuid[], useAllPositions: boolean, filters: IPositionsFilters) {
    const url = 'requests/backoffice/set-registry-excel-in-queue';
    const filtersPayload = {...filters};
    if (!useAllPositions) {
      filtersPayload.positionsGroupsIds = positionsGroupsIds;
      filtersPayload.positions = positions;
    }
    return this.api.post(url, { useAllPositions, filters: filtersPayload });
  }

  checkRegistryExcelStatus() {
    const url = 'requests/backoffice/registry-excel-queue-status';
    return this.api.post(url, {});
  }

  changePositionsStatus(positionIds: Uuid[], status: PositionStatus, statusComment: string[], useAllPositions?: boolean, filters?: RequestFilters) {
    const url = `requests/backoffice/positions/statuses/change`;
    return this.api.post<RequestPosition[]>(url, { positionIds, status, statusComment, filters: useAllPositions ? {...filters} : {} });
  }

}
