import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { UxgPopoverContentDirection } from "uxg";

@Component({
  selector: 'uxg-example-input',
  templateUrl: './uxg-example-input.component.html'
})
export class UxgExampleInputComponent {
  readonly example = `<form [formGroup]="form" (ngSubmit)="submit(form)">
    <!-- Whole form errors -->
    <div class="app-control-error" *ngIf="form.errors as e">
      <span *ngIf="e.invalid">Неверные имя пользователя или пароль.</span>
    </div>

    <!-- Username input -->
    <div class="app-control-wrap">
      <input #user uxgInput lg type="text" formControlName="user"/>
      <label class="app-control-label" (click)="user.focus()">Почта</label>

      <!-- Username errors -->
      <div class="app-control-error" *ngIf="form.get('user').errors as e">
        <span *ngIf="e.required">Обязательное поле</span>
        <span *ngIf="e.email">Неверная почта</span>
      </div>
    </div>

    <!-- Password input -->
    <div class="app-control-wrap">
      <input uxgInput type="password" lg formControlName="password" placeholder="Пароль"/>

      <!-- Password errors -->
      <ng-container *ngIf="form.get('password').errors as e">

        <uxg-popover #errorPopover class="app-control-icon-error" *ngIf="errorsCount(e) > 1; else passowrdSingleError">
          <uxg-icon shape="app-info" size="16" (mouseenter)="errorPopover.show()" (mouseleave)="errorPopover.hide()"></uxg-icon>
          <div *uxgPopoverContent="popoverDir.topRight" class="app-primary-color">
            <ng-container *ngTemplateOutlet="passwordErrors"></ng-container>
          </div>
        </uxg-popover>

        <ng-template #passowrdSingleError>
          <div class="app-control-error">
            <ng-container *ngTemplateOutlet="passwordErrors"></ng-container>
          </div>
        </ng-template>

        <ng-template #passwordErrors>
          <div *ngIf="e.required">Обязательное поле</div>
          <div *ngIf="e.minlength as e">Минимальная длина {{e.requiredLength}}, а сейчас {{e.actualLength}}</div>
          <div *ngIf="e.pattern">Заглавные и строчные буквы и цифры.</div>
        </ng-template>
      </ng-container>
    </div>

    <!-- Footer -->
    <div class="app-row app-align-items-center">
      <uxg-switcher label="Запомнить меня" labelAlign="right" formControlName="rememberMe"></uxg-switcher>
      <div class="app-col"></div>
      <div class="app-btn-group">
        <button uxgButton outline lg icon type="button" (click)="form.reset()">
          <uxg-icon shape="refresh" flip="horizontal" class="is-solid"></uxg-icon>
        </button>
        <button uxgButton primary lg iconText [disabled]="form.invalid">
          <uxg-icon shape="login" class="is-solid"></uxg-icon>
          <span>Войти</span>
        </button>
      </div>
    </div>
  </form>`;

  form = new FormGroup({
    user: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])[\S]*$/)
    ]),
    rememberMe: new FormControl()
  });

  popoverDir = UxgPopoverContentDirection;

  errorsCount(errors: ValidationErrors): number {
    return Object.keys(errors).length;
  }

  submit(form) {
    form.setErrors({invalid : true});
  }
}
