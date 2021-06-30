import { Component, Directive, HostBinding, Inject, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { Router, RouterLinkWithHref } from "@angular/router";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'uxg-example-controls',
  templateUrl: './uxg-example-controls.component.html',
  styles: ['.indent { padding: .5em 2em; }']
})
export class UxgExampleControlsComponent {
  readonly example1 = `<uxg-switcher label="Swich me"></uxg-switcher>`;
  readonly example2 = `<uxg-switcher label="Swich me" labelAlign="right"></uxg-switcher>`;
  readonly example3 = `<div class="app-row">
  <uxg-checkbox class="app-control" #controlCheckbox></uxg-checkbox>
  <label (click)="controlCheckbox.check($event)"> Check me</label>
</div>`;
  readonly example4 = `<form [formGroup]="form">
  <uxg-tree [tree]="[form]" [getChildrenFn]="getChildren">
    <div class="indent" *uxgTreeNodeWrap></div>
    <div class="app-row app-align-items-center" [formGroup]="formGroup" *uxgTreeNode="let formGroup">
      <uxg-checkbox #c class="app-control" formControlName="checked" uxgSelectAllFor="list"></uxg-checkbox>
      <label (click)="c.check($event)"> &nbsp; Check me</label>
    </div>
  </uxg-tree>
</form>`;
  readonly example4_1 = `export class FooComponent {
  public form = this.fb.group({
    checked: [false],
    foo: ["bar"],
    list: this.fb.array([...array of similar form groups ...])
  })

  getChildren = (form: FormGroup) => (form.get('list') as FormArray).controls;
}`;

  readonly example5 = `<div class="app-row app-align-items-center">
  <uxg-radio-item class="app-control" #radio1 name="radio" value="1" [(ngModel)]="radioValue" ></uxg-radio-item>
  <label (click)="radio1.select($event)">&nbsp;One</label>
</div>
`;

  buttonModel = {
    lg: false,
    clear: false,
    disabled: false,
  };

  type: 'primary' | 'secondary' | 'outline' | 'link' | 'clear' = "primary";
  subType: "" | "icon" | "iconText" = "";
  group = false;
  title = "button";

  form = this.initformGroup(
    false, false,
    this.initformGroup(
      false, false,
      this.initformGroup(),
      this.initformGroup(true),
      this.initformGroup(false, true),

    ),
    this.initformGroup(),
    this.initformGroup(
      false, false,
      this.initformGroup(true),
      this.initformGroup(
        false, true,
        this.initformGroup(true, true),
        this.initformGroup(true),
        this.initformGroup(),
      ),
      this.initformGroup(),
    )
  );
  radioValue;

  constructor(private fb: FormBuilder) {
  }

  initformGroup(disabled: boolean = false, value: boolean = false, ...formControls: AbstractControl[]) {
    return this.fb.group({
      checked: [{ value, disabled }],
      list: this.fb.array(formControls || [])
    });

  }

  get example() {
    const directives = Object.keys(this.buttonModel).filter(key => this.buttonModel[key]);
    directives.push(this.type);
    let title = "";

    if (this.subType) {
      title += `\n  <uxg-icon shape="app-trash" size="16" class="is-solid"></uxg-icon>`;
    }

    if (this.subType !== 'icon') {
      if (this.subType === 'iconText') {
        title += `\n  <span>${this.title}</span>`;
      } else {
        title += `${this.title}`;
      }
    }

    if (this.subType) {
      title += `\n`;
    }
    let output = `<button uxgButton ${directives.join(" ")}>${title}</button>`;
    if (this.group) {
      output = `<div class="app-btn-group">\n  ${output}\n  ${output}\n  ${output}\n</div>`;
    }

    return output;
  }

  getChildren = (form: FormGroup) => (form.get('list') as FormArray).controls;
}

@Directive({ selector: '[uxgRouterLinkActive]' })
export class UxgRouterLinkActiveDirective {
  @Input() uxgRouterLinkActive = "";

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router, private routerLinkWithHref: RouterLinkWithHref) {}
  @HostBinding('class') get active () {
    return this.routerLinkWithHref.href === this.router.url ? this.uxgRouterLinkActive : "";
  }

}
