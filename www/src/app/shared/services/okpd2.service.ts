import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Okpd2 } from "../models/okpd2";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class Okpd2Service {

  constructor(protected api: HttpClient) {
  }

  getOkpd2(searchText: string) {
    return this.api.post<Okpd2[]>(`okpd`, {searchText});
  }

  getOkpd2List(searchText: string): Observable<Okpd2[]> {
    const url = `#element#okpd2?q=${searchText}`;
    return this.api.get<Okpd2[]>(url);
  }
}
