import { Component, Input } from '@angular/core';
import { UxgWizzard } from "./uxg-wizzard";
import { UxgWizzardStep } from "./uxg-wizzard-step";

@Component({
  selector: 'uxg-wizzard-steps',
  templateUrl: 'uxg-wizzard-steps.component.html'
})

export class UxgWizzardStepsComponent {
  @Input() wizzard: UxgWizzard;

  getStepIcon<S>(stepInfo: UxgWizzardStep<S>) {
    switch (true) {
      case stepInfo.disabled: return 'app-lock';
      case stepInfo.completed: return 'app-check';
    }

    return null;
  }
}
