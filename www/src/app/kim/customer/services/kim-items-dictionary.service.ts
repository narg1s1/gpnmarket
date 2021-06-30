import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { KimDictionaryItem } from "../../common/models/kim-dictionary-item";

@Injectable()
export class KimItemsDictionaryService {
  constructor(private api: HttpClient) {}

  search(query: string) {
    const url = `kim/customer/dictionary-positions/search`;
    return this.api.post<KimDictionaryItem[]>(url, {query: query});
  }
}
