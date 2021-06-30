import { AbstractControl, ValidationErrors } from "@angular/forms";

export function proposalParametersFormValidator(control: AbstractControl, full = true): ValidationErrors | null {
  return (full ? control.value.length : 0) === control.value
    .filter(pos => pos.priceWithoutVat && pos.quantity && pos.measureUnit && pos.currency && pos.deliveryDate)
    .length ? null : { parameters_error: true };
}
