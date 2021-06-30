import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    value = value.replace(/\D+/g, "");

    return value ? '+' +
      // приводим к международному формату русские номера
      (value[0] === '8' ? '7' : value[0]) + ' '
      + value.substr(1, 3) + ' '
      + value.substr(4, 3) + '-'
      + value.substr(7, 2) + '-'
      + value.substr(9) : null;
  }
}
