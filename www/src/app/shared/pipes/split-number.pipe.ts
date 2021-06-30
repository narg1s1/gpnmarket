import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splitNumber' })
export class SplitNumberPipe implements PipeTransform {
  transform(value: number | string, fraction = 3): string {
    return value.toString().replace(new RegExp("(\\d{" + fraction + "})+?", "g"), "$1 ").trim();
  }
}
