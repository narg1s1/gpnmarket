import { Route as AngularRoutes } from "@angular/router";
import { FeatureList } from "../config/feature-list";

export type Routes = Route[];
export interface Route extends AngularRoutes {
  data?: {
    title?: string
    feature?: keyof typeof FeatureList
    hideTitle?: boolean
    noFooter?: boolean
    noContentPadding?: boolean
    hideBreadcrumbs?: boolean
  };
  children?: Routes;
}
