import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { AgreementsService } from "./services/agreements.service";
import { SharedModule } from "../../shared/shared.module";
import { NgxsModule } from "@ngxs/store";
import { AgreementListState } from "./states/agreement-list.state";
import { AgreementsCommonModule } from "../common/agreements-common.module";
import { AgreementsComponent } from "./components/agreements/agreements.component";
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [AgreementsComponent],
  providers: [AgreementsService],
    imports: [
        RouterModule,
        SharedModule,
        CommonModule,
        AgreementsCommonModule,
        NgxsModule.forFeature([
            AgreementListState
        ]),
        ReactiveFormsModule,
    ],
  exports: [AgreementsComponent]
})
export class AgreementsBackofficeModule {
}
