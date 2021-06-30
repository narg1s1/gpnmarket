export class UxgWizzardStep<S> {
  constructor(private step: S, private info: UxgWizzardStepInfo) {}

  get label(): string {
    return this.info.label;
  }

  get completed(): boolean {
    return this.info.completed === true;
  }

  get disabled(): boolean {
    return this.info.disabled;
  }

  get hidden(): boolean {
    return this.info.hidden;
  }

  get valid(): boolean {
    return !this.info.validator || this.info.validator();
  }

  get invalid(): boolean {
    return !this.valid;
  }

  complete = () => this.info.completed = true;

  reset = () => this.info.completed = false;

  disable = () => this.info.disabled = true;

  enable = () => this.info.disabled = false;

  toggle = (state: boolean) => this.info.hidden = !state;

  toString = (): S => this.step;
}

export class UxgWizzardStepInfo {
  label: string;
  completed?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  validator?: () => boolean;
}
