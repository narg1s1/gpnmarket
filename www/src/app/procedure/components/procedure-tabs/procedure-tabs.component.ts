import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import { UxgBreadcrumbsService } from "uxg";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { RequestState } from "../../../request/back-office/states/request.state";
import { Uuid } from "../../../cart/models/uuid";
import { ProposalSource } from "../../../request/back-office/enum/proposal-source";
import { Procedure } from "../../../request/back-office/models/procedure";
import { Request } from "../../../request/common/models/request";
import { StateStatus } from "../../../request/common/models/state-status";

@Component({
  selector: 'app-procedure-tabs',
  templateUrl: './procedure-tabs.component.html',
  styleUrls: ['./procedure-tabs.component.scss'],
})
export class ProcedureTabsComponent implements OnDestroy, OnInit {
  @Input() procedure: Procedure;
  @Input() activeTab: 'info' | 'technical-commercial-proposals';
  @Input() noContentPadding = false;
  @Input() proposalGroupId: Uuid;
  @Select(RequestState.request) request$: Observable<Request>;
  readonly destroy$ = new Subject();

  sourceFromUrl: ProposalSource;
  procedureUid: Uuid;
  approveType: "MATRIX" | "REFERENCE";
  tradingScheme: "TRADE" | "AGENT";
  state: StateStatus = "pristine";

  constructor(
    private title: Title,
    private bc: UxgBreadcrumbsService,
    private route: ActivatedRoute,
    protected router: Router,
    public store: Store
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sourceFromUrl = params.source;
      this.procedureUid = params.procedureUid;
      this.approveType = params.approveType;
      this.tradingScheme = params.tradingScheme;
    });

    this.route.params.pipe(
      tap(({id}) => {

        if (this.activeTab === 'technical-commercial-proposals') {
          if (this.proposalGroupId) {
            this.bc.breadcrumbs = [
              { label: "Процедуры", link: "/procedures" },
              { label: `Процедура №${this.procedure.procedureId}`,
                link: `/procedures/${id}/technical-commercial-proposals`,
                queryParams: {source: this.sourceFromUrl, procedureUid: this.procedure.id}
              },
              { label: `Предложения поставщиков`,
                link: `/procedures/${id}/technical-commercial-proposals`,
                queryParams: {source: this.sourceFromUrl, procedureUid: this.procedure.id, approveType: this.approveType, tradingScheme: this.tradingScheme}
              },
              { label: `Группа согласования позиций`,
                link: `/procedures/${id}/technical-commercial-proposals/group/${this.proposalGroupId}`,
                queryParams: {source: this.sourceFromUrl, procedureUid: this.procedure.id, approveType: this.approveType, tradingScheme: this.tradingScheme}
              },
            ];
          } else {
            this.bc.breadcrumbs = [
              { label: "Процедуры", link: "/procedures" },
              { label: `Процедура №${this.procedure.procedureId}`,
                link: `/procedures/${id}/technical-commercial-proposals`,
                queryParams: {source: this.sourceFromUrl, procedureUid: this.procedure.id}
              },
              { label: `Предложения поставщиков`,
                link: `/procedures/${id}/technical-commercial-proposals`,
                queryParams: {source: this.sourceFromUrl, procedureUid: this.procedure.id}
              }
            ];
          }
        }
        if (this.activeTab === 'info') {
          this.bc.breadcrumbs = [
            { label: "Процедуры", link: "/procedures" },
            { label: `Процедура №${this.procedure.procedureId}`,
              link: `/procedures/${id}/info`,
              queryParams: {source: this.sourceFromUrl}
            },
            { label: `Извещение о процедуре`,
              link: `/procedures/${id}/info`,
              queryParams: {source: this.sourceFromUrl}
            }
          ];
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
