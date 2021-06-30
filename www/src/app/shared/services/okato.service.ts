import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OkatoRegion } from "../models/okato-region";

@Injectable({
  providedIn: 'root'
})
export class OkatoService {

  constructor(protected api: HttpClient) {}

  getRegionsList(data): Observable<OkatoRegion[]> {
    const url = `#element#okato?q=${data}`;
    return this.api.get<OkatoRegion[]>(url);
  }
}
