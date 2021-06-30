import { Params } from "@angular/router";

export type UxgBreadcrumbs = UxgBreadcrumb[];

export class UxgBreadcrumb {
  label: string;
  link: any[] | string;
  queryParams?: Params;
}
