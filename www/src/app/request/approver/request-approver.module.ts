import { NgModule } from "@angular/core";
import { NgxsModule } from "@ngxs/store";
import { RequestCommonModule } from "../common/request-common.module";
import { RequestApproverRoutingModule } from "./request-approver-routing.module";
import { RequestState } from "./states/request.state";
import { RequestListState } from "./states/request-list.state";
import { PositionState } from "./states/position.state";
import { PositionComponent } from "./components/position/position.component";
import { RequestComponent } from "./components/request/request.component";
import { RequestListComponent } from "./components/request-list/request-list.component";

@NgModule({
  declarations: [
    PositionComponent,
    RequestComponent,
    RequestListComponent
  ],
  imports: [
    RequestApproverRoutingModule,
    NgxsModule.forFeature([
      RequestState,
      RequestListState,
      PositionState
    ]),
    RequestCommonModule
  ],
  exports: [
  ],
  providers: [
  ]
})
export class RequestApproverModule {
}
