import { AbstractControl, ValidationErrors } from "@angular/forms";
import * as moment from "moment";

export class PriceOrderFormValidators {
  static positions({ value }: AbstractControl): ValidationErrors {
    return (value || []).some(
      p => ["okpd2", "name", "quantity", "okei"].filter(k => !Object.keys(p).includes(k)).length
    ) ? { required: true } : null;
  }

  static dateResponseValidator({ value }: AbstractControl): ValidationErrors {
    let ammount = 3;
    for (let i = 1; i <= 3; i++) {
      // Не учитываем выходные дни
      if (["0", "6"].includes(moment().add(i, 'd').format("d"))) { ammount++; }
    }
    const minDate = moment().add(ammount, "d").startOf('day');
    return !value || moment(value, "DD.MM.YYYY").isSameOrAfter(minDate) ? null : { expired: true };
  }
}
