import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { filter, map, mergeMap, tap } from "rxjs/operators";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { AuthService } from "./auth/services/auth.service";
import { UserInfoService } from "./user/service/user-info.service";
import { CartStoreService } from "./cart/services/cart-store.service";
import { Subscription } from "rxjs";
import { UxgBreadcrumbsService } from "uxg";
import { FeatureService } from "./core/services/feature.service";
import { APP_CONFIG, GpnmarketConfigInterface } from "./core/config/gpnmarket-config.interface";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { NotificationListComponent } from "./core/components/notification-list/notification-list.component";
import { ElementBearerService, NotificationService } from "isource-element";
import { Store } from "@ngxs/store";
import { ToastActions } from "./shared/actions/toast.actions";
import { KeycloakService } from "keycloak-angular";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('notificationModal') notificationModal: NotificationListComponent;

  subscription = new Subscription();
  isBreadcrumbsHidden: boolean;
  noContentPadding: boolean;
  noHeaderStick: boolean;
  noFooter: boolean;
  _isTitleHidden: boolean;
  readonly year = new Date().getFullYear();


  constructor(
    @Inject(APP_CONFIG) public appConfig: GpnmarketConfigInterface,
    @Inject(PLATFORM_ID) private platform: Object,
    @Inject(DOCUMENT) private document: Document,
    public bc: UxgBreadcrumbsService,
    public featureService: FeatureService,
    public user: UserInfoService,
    public titleService: Title,
    public authService: AuthService,
    public elementNotification: NotificationService,
    private renderer: Renderer2,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cartStoreService: CartStoreService,
    private store: Store,
    private cd: ChangeDetectorRef,
    private bearerService: ElementBearerService,
    private keycloakService: KeycloakService,
  ) {
    // GA & Yandex Metrika
    if (isPlatformBrowser(this.platform)) {
      const ym = window['ym'];
      window['dataLayer'] = window['dataLayer'] || [];

      function gtag(...a) {
        window['dataLayer'].push(arguments);
      }

      if (appConfig.ga.id) {
        const gaScript: HTMLScriptElement = this.renderer.createElement('script');
        gaScript.setAttribute('async', 'true');
        gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${ appConfig.ga.id }`);
        this.renderer.appendChild(this.document.documentElement.firstChild, gaScript);

        gtag('js', new Date());
        gtag('config', appConfig.ga.id);
      }

      if (appConfig.metrika.id) {
        ym(appConfig.metrika.id, "init", appConfig.metrika.options ?? {});
      }

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd && isPlatformBrowser(this.platform)),
        tap((e: NavigationEnd) => {
          if (isPlatformBrowser(this.platform)) {
            if (appConfig.ga.id) {
              gtag('event', 'page_view', { 'send_to': appConfig.ga.id });
            }

            if (appConfig.metrika.id) {
              ym(appConfig.metrika?.id, "hit", e.urlAfterRedirects);
            }
          }
        }),
      ).subscribe();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === "primary"),
      mergeMap(route => route.data),
      tap(data => {
        this.isBreadcrumbsHidden = data.hideBreadcrumbs;
        this.noContentPadding = data.noContentPadding;
        this.noHeaderStick = data.noHeaderStick;
        this.noFooter = data.noFooter;
        this._isTitleHidden = data.hideTitle;
        this.bc.breadcrumbs = [];
        this.titleService.setTitle(data.title);
        this.cd.detectChanges();
        this.notificationModal.close();
      }),
    ).subscribe();
  }

  ngOnInit() {
    this.keycloakService.getToken(false).then(token => this.bearerService.token = token);

    if (this.user.isCustomer()) {
      // Выгружаем корзину при логауте
      this.subscription
        .add(this.authService.onLogout.subscribe(() => {
          this.cartStoreService.cartItems = [];
        }));
    }

    this.subscription.add(this.elementNotification.notify$
      .subscribe(text => this.store.dispatch(new ToastActions.Success(text))));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
