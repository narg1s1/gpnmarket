import * as Sentry from "@sentry/browser";
import { AppConfig } from "../../config/app.config";
import { ErrorHandler, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";

Sentry.init({
  dsn: AppConfig.sentry.dsn,
  enabled: AppConfig.sentry.enabled,
  environment: AppConfig.sentry.environment
});

Sentry.configureScope((scope) => scope.setLevel(AppConfig.sentry.level));

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}

  extractError(error) {
    // обработка ошибок с бэкэнда
    if (error instanceof HttpErrorResponse) {
      return `${error.message}, detail: "${error.error?.detail}"`;
    }

    return error.originalError || error;
  }

  handleError(error) {
    const extractedError = this.extractError(error);
    Sentry.captureException(extractedError);
    throw error;
  }
}
