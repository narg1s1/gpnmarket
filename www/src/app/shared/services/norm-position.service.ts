import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Okei } from '../models/okei';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NormPositionService {

  constructor(protected api: HttpClient) {}

  searchSuggestions(query: string): Observable<string[]> {
    return this.api.post<string[]>(`norm-positions/search-suggestions`, {query});
  }
}
