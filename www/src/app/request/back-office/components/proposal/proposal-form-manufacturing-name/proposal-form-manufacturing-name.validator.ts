import { AbstractControl, ValidationErrors } from "@angular/forms";

export function proposalManufacturingNameValidator(control: AbstractControl, full = true): ValidationErrors | null {
  return (full ? control.value.length : 0) === control.value
    .filter(pos => pos.manufacturingName).length ? null : { manufacturing_name_error: true };
}
