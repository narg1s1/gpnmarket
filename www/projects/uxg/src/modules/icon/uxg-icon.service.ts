import { Injectable } from '@angular/core';
import { UxgIcons } from "./uxg-icons";

@Injectable()
export class UxgIconService {
  icons: {[key in keyof typeof UxgIcons]: string} = UxgIcons;

  add(icons: {[key: string]: string}) {
    this.icons = {...this.icons, ...icons};
  }

  get(shape: string) {
    return this.icons[shape] ?? console.warn(`Shape ${shape} not found!`);
  }
}
