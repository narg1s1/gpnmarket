import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable } from "rxjs";
import { APP_CONFIG, GpnmarketConfigInterface } from "../config/gpnmarket-config.interface";
import { KeycloakService } from "keycloak-angular";
import { skipWhile, switchMap, tap } from "rxjs/operators";

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor(@Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface, private keycloakService: KeycloakService) {
  }

  /**
   * Добавляет хост из конфига к урлу
   *  Для подключения в требуемом модуле нужно указать внутри массива interceptors, как HTTP_INTERCEPTOR
   * @param  req
   * @param  next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.indexOf('#chat#') === 0) {
      req = req.clone({
        url: req.url.replace("#chat#", this.appConfig.endpoints.apiChat)
      });
      return next.handle(req);
    }

    if (req.url.indexOf('#profile#') === 0) {
      req = req.clone({
        headers: req.headers.set('Accept', 'application/json'),
        url: req.url.replace("#profile#", this.appConfig.profile.url)
      });
      return next.handle(req);
    }

    if (req.url.indexOf('#intelplan#') === 0) {
      req = req.clone({
        headers: req.headers.set('Accept', 'application/json'),
        url: req.url.replace("#intelplan#", this.appConfig.intelplan.url)
      });
      return next.handle(req);
    }

    if (req.url.indexOf('#element#') === 0) {
      req = req.clone({
        headers: req.headers.set('Accept', 'application/json'),
        url: req.url.replace("#element#", this.appConfig.element.url)
      });
      return next.handle(req);
    }

    if (req.url.indexOf('#notifications#') === 0) {
      return from(this.keycloakService.getToken()).pipe(
        skipWhile(token => !token),
        tap(token => req = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
          url: req.url.replace("#notifications#", this.appConfig.notifications.url)
        })),
        switchMap(() => next.handle(req)));
    }

    if (req.url.indexOf('http') === 0 || req.url.indexOf('https') === 0 ) {
      return next.handle(req);
    }
    const url = this.appConfig.endpoints.api;
    req = req.clone({
      url: url + req.url
    });
    return next.handle(req);
  }
}
