
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: "bytesToSize",
})
export class BytesToSizePipe implements PipeTransform {

  transform(bytes: number, demicals?: number, ...sizes: string[]): string {

    if (sizes.length === 0) {
      sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    }

    if (bytes === 0) {
      return bytes + sizes[0];
    }

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(demicals < 0 ? 0 : demicals || 0)) + ' ' + sizes[i];
  }
}
