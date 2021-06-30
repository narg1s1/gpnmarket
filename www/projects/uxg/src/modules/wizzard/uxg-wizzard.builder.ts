import { Injectable } from '@angular/core';
import { UxgWizzardStep, UxgWizzardStepInfo } from "./uxg-wizzard-step";
import { UxgWizzard } from "./uxg-wizzard";

@Injectable({
  providedIn: 'root'
})
export class UxgWizzardBuilder {

  create<S>(stepsConfig: UxgWizzardStepConfig, current?: S): UxgWizzard<S> {
    const steps: UxgWizzardStep<S>[] = Object.entries(stepsConfig)
      .map(([step, config]) => {
        return new UxgWizzardStep<S>(step as any, this.createStepInfo(config));
      });

    return new UxgWizzard<S>(steps, current);
  }

  createStepInfo = (config: UxgWizzardStepInfoConfig): UxgWizzardStepInfo => {
    if (typeof config === 'string') {
      return { label: config };
    } else if (Array.isArray(config)) {
      const [label, validator] = config;
      return { label, validator };
    } else {
      return config;
    }
  }
}

export interface UxgWizzardStepConfig {
  [key: string]: UxgWizzardStepInfoConfig;
}

export type UxgWizzardStepInfoConfig = UxgWizzardStepInfo | string | [string, () => boolean];
