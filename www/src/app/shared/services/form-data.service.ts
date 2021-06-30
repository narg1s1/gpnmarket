import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {
  toFormData(data, form = new FormData(), parentKey?): FormData {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data)
        .forEach(key => this.toFormData(data[key], form, parentKey ? `${parentKey}[${key}]` : key));
    } else if (data !== null) {
      form.append(parentKey, data);
    }
    return form;
  }
}
