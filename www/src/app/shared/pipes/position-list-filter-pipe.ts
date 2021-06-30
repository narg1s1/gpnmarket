import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'positionSearchFilter'})
export class PositionSearchFilterPipe implements PipeTransform {
  transform(value: any, input: string) {
    if (input) {
      input = input.toLowerCase().trim();
      return value.filter(function (el: any) {
        return el.name.toLowerCase().indexOf(input) > -1;
      });
    }
    return value;
  }
}
