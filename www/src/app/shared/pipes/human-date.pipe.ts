import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'humanDate'
})
export class HumanDatePipe implements PipeTransform {

  /**
   * Если дата сегодняшняя, то возвращает время, иначе дату со временем
   *
   * @param value
   * @param args
   */
  transform(value: any, ...args: any[]): any {
    return moment(new Date()).isSame(value, 'date') ?
      moment(value).format('HH:mm') :
      moment(value).format('MM.DD HH:mm');
  }
}
