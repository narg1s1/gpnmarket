import { TemplateRef } from "@angular/core";

export class Toast {
  text?: string;
  type?: "success" | "error" | "info" | "warning";
  component?;
  template?: TemplateRef<any>;
  removeOnClick?: boolean;
  lifetime?: number;
}
