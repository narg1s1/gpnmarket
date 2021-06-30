import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, GpnmarketConfigInterface } from "../config/gpnmarket-config.interface";
import { Feature } from "../models/feature";
import { UserRole } from "../../user/models/user-role";
import { FeatureList, IFeatureList } from "../config/feature-list";
import { UserInfoService } from "../../user/service/user-info.service";

@Injectable({
  providedIn: "root"
})
export class FeatureService {

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    protected user: UserInfoService
  ) {}

  private get disabledFeatures(): (keyof IFeatureList)[] {
     return this.appConfig.disabledFeatures || [];
  }

  getFeature(featureName: keyof IFeatureList): Feature {
    if (FeatureList.hasOwnProperty(featureName)) {
      return FeatureList[featureName];
    } else {
      throw new Error(`Feature ${featureName} does not exist`);
    }
  }

  disabled(featureName: keyof IFeatureList): boolean {
    return this.getFeature(featureName).disabled || this.disabledFeatures.indexOf(featureName) >= 0;
  }

  allowed(featureName: keyof IFeatureList, roles: UserRole[]): boolean {
    const featureRoles = this.getFeature(featureName).roles;
    const rolesMatch = this.getFeature(featureName).rolesMatch;

    return !featureRoles || featureRoles
      .filter(role => roles.indexOf(role) >= 0).length > (rolesMatch === 'full' ? featureRoles.length : 0);
  }

  available(featureName: keyof IFeatureList, roles?: UserRole[]): boolean {
    return !this.disabled(featureName) && (!roles || this.allowed(featureName, roles));
  }

  authorize(permission: keyof IFeatureList) {
    return this.available(permission, this.user.roles);
  }
}
