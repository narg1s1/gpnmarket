import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CustomValidators } from "../../../shared/forms/custom.validators";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ResponseSuccessError } from "../../../core/interceptor/error.interceptor";
import { takeUntil } from "rxjs/operators";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html'
})
export class ForgotPasswordFormComponent implements OnDestroy {

  form: FormGroup;
  destroy$ = new Subject();
  state: "pristine" | "loading" | "error" | "exception" | "success" = "pristine";

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private title: Title
  ) {
    this.form = this.fb.group({
      'email': ['', [Validators.required, CustomValidators.email]]
    });
  }


  submit() {
    if (this.form.invalid) {
      return;
    }
    this.state = "loading";
    this.authService.requestPasswordRecover(this.form.get('email').value).pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.title.setTitle("Успешно!");
        this.state = "success";
      },
      (error) => {
        if (error instanceof ResponseSuccessError) {
          this.title.setTitle("Не удалось отправить письмо");
          this.state = "error";
        } else {
          this.title.setTitle("Что-то пошло не так");
          this.state = "exception";
        }
      });
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
