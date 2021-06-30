import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { ActivationErrorCode } from "../../enum/activation-error-code";
import { ActivationErrorCodeLabels } from "../../dictionaries/activation-error-code-labels";
import { ActivationError } from "../../models/activation-error";
import { Title } from "@angular/platform-browser";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-activation-form',
  templateUrl: './activation-form.component.html'
})
export class ActivationFormComponent implements OnInit, OnDestroy {

  loading = false;
  state: "completeActivation" | "completeResend" = null;
  code: string;
  errorCode: string;
  readonly ErrorCode = ActivationErrorCode;
  readonly destroy$ = new Subject();

  constructor(
    public title: Title,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.code = this.route.snapshot.queryParams.code;

    if (this.route.snapshot.queryParams?.activated === 'false') {
      this.responseProcessing({ error: ActivationErrorCode.NOT_ACTIVATED });
    } else if (this.code) {
      this.loading = true;

      this.authService.activateAccount(this.code)
        .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
        .subscribe(data => this.responseProcessing(data));
    } else {
      this.responseProcessing({ error: ActivationErrorCode.INVALID_LINK });
    }
  }

  resendActivationLink(code: string): void {
    this.loading = true;

    this.authService.resendActivationLink(code)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe(data => this.responseProcessing(data, true));
  }

  responseProcessing(response: ActivationError, resend?: boolean): void {
    if (!response.error) {
      this.title.setTitle(resend ? 'Письмо отправлено' : 'Профиль активирован');
      this.state = resend ? 'completeResend' : 'completeActivation';
      this.errorCode = null;
    } else {
      this.errorCode = response.error ?? ActivationErrorCode.UNKNOWN;
      this.title.setTitle(ActivationErrorCodeLabels[this.errorCode]);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
