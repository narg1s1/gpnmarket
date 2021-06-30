import { AbstractControl, ValidationErrors } from "@angular/forms";

export function proposalManufacturerValidator(control: AbstractControl, full = true): ValidationErrors | null {
  return (full ? control.value.length : 0) === control.value
    .filter(pos => pos.manufacturer).length ? null : { manufacturer_error: true };
}
