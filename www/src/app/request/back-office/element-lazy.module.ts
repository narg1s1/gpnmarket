import { NgModule } from "@angular/core";
import { ElementModule } from "isource-element";
import { AppConfig } from "../../config/app.config";

@NgModule({
  imports: [ElementModule.config(AppConfig.element)],
})
export class ElementLazyModule {
}
