import { IAvailableProposalsFilters } from './../../procedure/models/proposals-filters';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, debounceTime, scan, tap, map } from 'rxjs/operators';
import { searchUsers, searchContragents, searchString } from 'src/app/shared/helpers/search';

@Injectable()
export class FilterService {

  readonly responsibleUsersSearch$ = new BehaviorSubject<string>("");
  readonly contragentUsersSearch$ = new BehaviorSubject<string>("");
  readonly procedureRegistryNumbersSearch$ = new BehaviorSubject<string>("");
  readonly requestsNumbersSearch$ = new BehaviorSubject<string>("");

  responsibleUsers$: Observable<{ label: string, value: string }[]>;
  contragentUsers$: Observable<{ label: string, value: string }[]>;
  statuses$: Observable<{ item: string, value: string }[]>;
  procedureRegistryNumbers$: Observable<{ label: string, value: string }[]>;
  requestsNumbers$: Observable<{ label: string, value: string }[]>;

  constructor(private route: ActivatedRoute, private router: Router) { }

  // Поиск внутри фильтров
  public searchByAvailableFilters(availableFilters$: Observable<IAvailableProposalsFilters>) {
    this.responsibleUsers$ = this.responsibleUsersSearch$.pipe(
      switchMap(q => availableFilters$.pipe(
        map((filter: any) => searchUsers(q, filter?.responsibleUsers ?? []).map(u => ({ label: u.shortName, value: u.id })))
      )),
    );

    this.contragentUsers$ = this.contragentUsersSearch$.pipe(
      switchMap(q => availableFilters$.pipe(
        map((filter: any) => searchContragents(q, filter?.contragentUsers ?? []).map(u => ({ label: u.shortName, value: u.id })))
      )),
    );

    this.statuses$ = availableFilters$?.pipe(map((filter: any) => filter?.statuses.map(
      status => ({ value: status.status, item: status })
    )));

    this.procedureRegistryNumbers$ = this.procedureRegistryNumbersSearch$.pipe(
      switchMap(q => availableFilters$?.pipe(
        map((filter: any) => searchString(q, filter?.procedureRegistryNumbers ?? []).map(regNum => ({ value: regNum, label: regNum})))
      ))
    );

    this.requestsNumbers$ = this.requestsNumbersSearch$.pipe(
      switchMap(q => availableFilters$?.pipe(
        debounceTime(100),
        map((filter: any) => searchString(q, filter?.requestsNumbers ?? []).map(regNum => ({ value: regNum, label: regNum})))
      ))
    );
  }

    // Подписка на изменение фильтров
    public subscribeOnFiltersChange(fetchFilters$: Observable<any>) {
      return fetchFilters$.pipe(
        debounceTime(100),
        tap(({ filters }) => {
          if (+this.route.snapshot.queryParams.page > 1 && filters) {
            this.router.navigate(["."], { relativeTo: this.route, queryParams: null });
          }
        }),
        scan(({ filters: prev, sort: prevSort }, { page = 1, filters: curr, sort: currSort }) => {
          const filters = { ...prev, ...curr };
          // тут можно разместить свою логику фильтрации
          return ({ page, filters, sort: { ...prevSort, ...currSort } });
        }, {} as any),
      );
    }
}
