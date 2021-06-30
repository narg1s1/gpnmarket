import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { RestorationResponse } from "../../models/restoration-response";
import { Title } from "@angular/platform-browser";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html'
})
export class ChangePasswordFormComponent implements OnInit, OnDestroy {

  state: "pristine" | "security" | "success" | "error" | "loading" = "pristine";
  code: string;
  error: RestorationResponse["error"];
  destroy$ = new Subject();
  form: FormGroup;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    public title: Title,
  ) {
  }

  ngOnInit() {
    this.form = this.fb.group({
        code: [this.route.snapshot.queryParams?.code, Validators.required],
        password: ["", [Validators.required, CustomValidators.password]],
        retypePassword: ["", [Validators.required, CustomValidators.comparePassword('password')]],
      }
    );
    this.form.get('password').valueChanges.subscribe(() => this.form.get('retypePassword').updateValueAndValidity());

    if (this.form.get('code').invalid) {
      this.router.navigateByUrl("/auth/forgot-password", {skipLocationChange: true});
    }
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const { password, code } = this.form.value;
    this.state = "loading";

    this.authService.changePasswordByCode(password, code).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.error) {
          this.error = response.error;
          this.state = "error";
          this.title.setTitle('Не удалось изменить пароль');
        } else {
          this.state = "success";
          this.title.setTitle('Пароль изменен');
        }
      },
      ({ error }) => {
        this.error = error;
        this.state = "error";
        this.title.setTitle('Не удалось изменить пароль');
      }
    );
  }

  get passwordExpireDate() {
    // todo дата генерится на фронте временно, позже будет подтягиватся из ответа с бэка
    return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  }

  reset() {
    this.title.setTitle(this.route.snapshot.data?.title);
    this.state = 'pristine';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
