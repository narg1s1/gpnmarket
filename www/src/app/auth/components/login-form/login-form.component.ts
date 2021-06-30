import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { UserInfoService } from "../../../user/service/user-info.service";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { finalize, switchMap, takeUntil } from "rxjs/operators";
import { ActivationErrorCode } from "../../enum/activation-error-code";
import { FeatureService } from "../../../core/services/feature.service";
import { AuthErrorCode } from "../../enum/auth-error-code";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnDestroy {

  loading = false;
  readonly destroy$ = new Subject();
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, CustomValidators.email]],
    password: ['', Validators.required]
  });

  constructor(
    public router: Router,
    public featureService: FeatureService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private user: UserInfoService,
    private formBuilder: FormBuilder,
  ) {}

  submit() {
    const { email, password } = this.form.value;
    this.loading = true;

    this.authService.login(email, password).pipe(
      switchMap(() => this.authService.saveAuthUserData()),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe(() => {
        // если был обратный урл, то после логина перейдем по нему
        const returnUrl = this.route.snapshot.queryParams.returnUrl || "/";
        this.router.navigateByUrl(returnUrl);
      },
      // если ошибка, то считаем что логин/пароль не подошли
      ({error}) => {
        if (error?.error === ActivationErrorCode.NOT_ACTIVATED ) {
          this.router.navigateByUrl('activate?activated=false');
        }

        if (error?.title === AuthErrorCode.INVALID_GRANT) {
          this.form.get('password').setErrors({invalid_credentials: true});
        }
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
