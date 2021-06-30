import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { FeatureService } from "./services/feature.service";
import { UserInfoService } from "../user/service/user-info.service";
import { AuthService } from "../auth/services/auth.service";
import { AppAuthGuard } from "../auth/app-auth.guard";
import { KeycloakService } from "keycloak-angular";

@Injectable({
  providedIn: 'root'
})
export class CanActivateFeatureGuard implements CanActivate {

  constructor(private router: Router, private feature: FeatureService, private userInfo: UserInfoService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    if (route.data["feature"]) {
      if (this.feature.disabled(route.data["feature"])) {
        this.router.navigate(['/not-found']);
        return false;
      }

      if (!this.feature.allowed(route.data["feature"], this.userInfo.roles)) {
        if (this.userInfo.getUserInfo()) {
          this.router.navigate(['/forbidden']);
        }

        return false;
      }
    }

    return true;
  }
}
