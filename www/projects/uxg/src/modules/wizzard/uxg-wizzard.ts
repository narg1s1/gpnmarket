import { UxgWizzardStep } from "./uxg-wizzard-step";

export class UxgWizzard<S = string> implements Iterable<UxgWizzardStep<S>> {
  constructor(private steps: UxgWizzardStep<S>[], public current: S | UxgWizzardStep<S>) {
    this.current = this.current || this.activeSteps[0];
  }

  get(step: S): UxgWizzardStep<S> {
    return this.steps.find(_step => this.equal(step, _step));
  }

  previous(): void {
    if (!this.isFirst) {
      this.current = this.activeSteps[this.index - 1];
    }
  }

  next() {
    if (!this.isLast && !this.isCurrentInvalid) {
      this.activeSteps[this.index].complete();
      this.current = this.activeSteps[this.index + 1];
    }
  }

  reset() {
    this.current = this.activeSteps[0];
    this.steps.forEach(step => step.reset());
  }

  isCurrent(step: UxgWizzardStep<S>): boolean {
    return this.equal(this.current, step);
  }

  get isCurrentInvalid(): boolean {
    return this.steps.find(step => this.equal(this.current, step)).invalid;
  }

  get isLast(): boolean {
    return this.index === this.activeSteps.length - 1;
  }

  get isFirst(): boolean {
    return this.index === 0;
  }

  private get index(): number {
    return this.activeSteps.findIndex((step) => this.equal(this.current, step));
  }

  private equal(step: S | UxgWizzardStep<S>, compare: UxgWizzardStep<S>) {
    return compare === step || compare.toString() === step;
  }

  private get visibleSteps() {
    return this.steps.filter((step) => step.hidden !== true);
  }

  private get activeSteps() {
    return this.visibleSteps.filter((step) => step.disabled !== true);
  }

  * [Symbol.iterator](): Iterator<UxgWizzardStep<S>> {
    for (const step of this.visibleSteps) { yield step; }
  }
}
