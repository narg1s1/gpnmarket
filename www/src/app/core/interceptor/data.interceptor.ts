import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable()
export class DataInterceptor implements HttpInterceptor {

  /**
   * При успешном ответе убирает из запроса success и кладет данные из data в body запроса
   *
   * @param {HttpRequest<any>} req
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<any>>}
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req)
      .pipe(
        map((event: HttpEvent<any>) => {
            return event instanceof HttpResponse && 'success' in event.body && 'data' in event.body ?
              event.clone({
                body: event.body.data
              }) :
              event;
          }
        )
      );
  }
}
