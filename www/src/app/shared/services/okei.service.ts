import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Okei } from '../models/okei';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OkeiService {

  constructor(protected api: HttpClient) {}

  getOkeiList(): Observable<Okei[]> {
    return this.api.get<Okei[]>(`okei`, {});
  }

  searchOkei(query, okei: Okei[]) {
    return (q => okei
      .filter(({name, symbol}) => (symbol?.toLowerCase().indexOf(q) >= 0 || name?.toLowerCase().indexOf(q) >= 0))
      .sort((a, b) => {
        const i = a.symbol?.toLowerCase().indexOf(q) + a.name?.toLowerCase().indexOf(q);
        const j = b.symbol?.toLowerCase().indexOf(q) + b.name?.toLowerCase().indexOf(q);
        return (i > -1 && i < j) ? -1 : 1;
      })
      .slice(0, 5)
    )(query.toLowerCase());
  }

}
