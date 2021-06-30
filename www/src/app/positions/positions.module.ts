import { UxgIconModule } from './../../../projects/uxg/src/modules/icon/uxg-icon.module';
import { CommercialProposalsService } from './../request/back-office/services/commercial-proposals.service';
import { ProcedureService } from './../request/back-office/services/procedure.service';
import { RequestState } from './../request/back-office/states/request.state';
import { RequestCommonModule } from './../request/common/request-common.module';
import { PositionsButtonsComponent } from './positions-buttons/positions-buttons.component';
import { PositionsListState } from './positions.state';
import { NgxsModule } from '@ngxs/store';
import { Routes } from './../core/models/routes';
import { CanActivateFeatureGuard } from './../core/can-activate-feature.guard';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionsComponent } from './positions.component';

const routes: Routes = [
  {
    path: '',
    component: PositionsComponent,
    canActivate: [CanActivateFeatureGuard],
    data: { title: "Все позиции", feature: "positionsList" }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxsModule.forFeature([
      PositionsListState,
      RequestState
    ]),
    RequestCommonModule,
    UxgIconModule
  ],
  exports: [RouterModule],
  declarations: [PositionsComponent, PositionsButtonsComponent],
  providers: [ProcedureService, CommercialProposalsService]
})
export class PositionsModule { }
