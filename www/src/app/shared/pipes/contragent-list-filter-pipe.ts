import { Pipe, PipeTransform } from '@angular/core';
import { searchContragents } from "../helpers/search";

@Pipe({name: 'contragentSearchFilter'})

export class ContragentSearchFilterPipe implements PipeTransform {
  transform(value: any, input: string) {
    if (input) {
      return searchContragents(input, value);
    }
    return value;
  }
}
