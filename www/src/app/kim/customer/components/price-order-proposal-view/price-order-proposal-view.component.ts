import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UxgBreadcrumbsService, UxgTabTitleComponent } from "uxg";
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { PriceOrderProposalsState } from "../../states/price-order-proposals.state";
import { startWith, switchMap, takeUntil, tap } from "rxjs/operators";
import { Uuid } from "../../../../cart/models/uuid";
import { ActivatedRoute } from "@angular/router";
import { PriceOrderProposalsActions } from "../../actions/price-order-proposals.actions";
import { Title } from "@angular/platform-browser";
import { ContragentShortInfo } from "../../../../contragent/models/contragent-short-info";
import { AppComponent } from "../../../../app.component";
import { StateStatus } from "../../../../request/common/models/state-status";
import { KimPriceOrderProposal } from "../../../common/models/kim-price-order-proposal";
import { DOCUMENT, getCurrencySymbol } from "@angular/common";
import { KimPriceOrderPosition } from "../../../common/models/kim-price-order-position";
import { KimPriceOrder } from "../../../common/models/kim-price-order";
import { GridFooterComponent } from "../../../../shared/components/grid/grid-footer/grid-footer.component";
import { Proposal } from "../../../../shared/components/grid/proposal";
import Fetch = PriceOrderProposalsActions.Fetch;
import ApproveMultiple = PriceOrderProposalsActions.ApproveMultiple;
import { Position } from "../../../../shared/components/grid/position";
import { GridRowComponent } from "../../../../shared/components/grid/grid-row/grid-row.component";
import { ProposalsView } from "../../../../shared/models/proposals-view";
import { GridSupplier } from "../../../../shared/components/grid/grid-supplier";

@Component({
  templateUrl: './price-order-proposal-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderProposalViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(GridRowComponent) proposalsOnReview: QueryList<GridRowComponent>;
  @ViewChild(GridFooterComponent, { read: ElementRef }) proposalsFooterRef: ElementRef;
  @ViewChild('reviewedTab') reviewedTab: UxgTabTitleComponent;

  @Select(PriceOrderProposalsState.positionsWithProposals(false))
  positionsOnReview$: Observable<KimPriceOrderPosition[]>;
  @Select(PriceOrderProposalsState.positionsWithProposals(true))
  positionsReviewed$: Observable<KimPriceOrderPosition[]>;
  @Select(PriceOrderProposalsState.proposalsLength) proposalsLength$: Observable<number>;
  @Select(PriceOrderProposalsState.priceOrder) priceOrder$: Observable<KimPriceOrder>;
  @Select(PriceOrderProposalsState.status) status$: Observable<StateStatus>;
  priceOrderId: Uuid;
  view: ProposalsView = "grid";
  gridRows: ElementRef[];
  showedProposal: Proposal;
  modalData: { proposal: Proposal, position: Position };
  readonly destroy$ = new Subject();
  readonly chooseBy$ = new Subject<"date" | "price">();
  readonly getCurrencySymbol = getCurrencySymbol;

  get total() {
    return this.proposalsOnReview?.reduce((total, { selectedProposal }) => {
      const proposalPosition: KimPriceOrderProposal = selectedProposal.value;
      total += proposalPosition?.priceWithoutVat * proposalPosition?.quantity || 0;
      return total;
    }, 0);
  }

  get disabled() {
    return this.proposalsOnReview
      .toArray().some(({selectedProposal: c}) => c.invalid);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private store: Store,
    private title: Title,
    private bc: UxgBreadcrumbsService,
    private cd: ChangeDetectorRef,
    private app: AppComponent
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.priceOrderId = id),
      switchMap(({id}) => this.store.dispatch(new Fetch(id))),
      switchMap(() => this.priceOrder$),
      tap(({id, name}) => this.title.setTitle(name)),
      tap(({id, name}) => this.bc.breadcrumbs = [
        { label: 'Мои ценовые запросы', link: `/kim/customer/price-orders` },
        { label: name, link: `/kim/customer/price-orders/${id}` }
      ]),
      takeUntil(this.destroy$),
    ).subscribe();

    this.switchView(this.view);
  }

  ngAfterViewInit() {
    const footerEl = this.document.querySelector('.app-footer');
    footerEl.parentElement.insertBefore(this.proposalsFooterRef.nativeElement, footerEl);

    this.proposalsOnReview.changes.pipe(
      startWith(this.proposalsOnReview),
      tap(() => this.gridRows = this.proposalsOnReview.reduce((gridRows, c) => [...gridRows, ...c.gridRows], [])),
      tap(() => this.cd.detectChanges()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  switchView(view: ProposalsView) {
    this.view = view;
    this.app.noContentPadding = view === "grid";
    this.cd.detectChanges();
  }

  hasAnalogs(positions: KimPriceOrderPosition[]) {
    return i => positions.map(({ proposals }) => proposals[i]).some(p => p?.isAnalog);
  }

  suppliers(positions: KimPriceOrderPosition[]) {
    return positions.reduce((suppliers: GridSupplier[], { proposals }) => {
      [false, true].forEach(hasAnalogs => {
        proposals
          .filter(({ proposalSupplier, isAnalog }) => {
            return suppliers.findIndex(({ id }) => proposalSupplier.supplier.id === id) < 0 && isAnalog === hasAnalogs;
          })
          .forEach(({ proposalSupplier }) => suppliers.push({...proposalSupplier.supplier, hasAnalogs}));
      });

      return suppliers;
    }, []);
  }

  rejectAll(positions: KimPriceOrderPosition[]) {
    // @TODO: ждём бэк на выбор победителя
    positions.map(({ id }) => id);
  }

  reviewSelected() {
    this.store.dispatch(new ApproveMultiple(
      this.priceOrderId,
      this.proposalsOnReview
        .filter(({selectedProposal: c}) => c.valid)
        .map(({selectedProposal: c}) => c.value.id)
    ));
  }

  convertProposals(position: KimPriceOrderPosition) {
    return position.proposals.map(proposal => new Proposal<KimPriceOrderProposal>(
      proposal,
      p => ({ ...p, deliveryDate: p.proposalSupplier.dateDelivery, measureUnit: position.okeiItem?.symbol }))
    );
  }

  convertPosition(position: KimPriceOrderPosition, priceOrder) {
    return new Position<KimPriceOrderPosition>(
      position,
      p => ({ ...p, deliveryDate: priceOrder.dateDelivery, measureUnit: p.okeiItem?.symbol })
    );
  }

  getProposalBySupplier = (position: KimPriceOrderPosition) => ({ id }: ContragentShortInfo) => {
    const proposal = position.proposals.find(({ proposalSupplier: { supplier } }) => supplier.id === id);
    return proposal ? new Proposal<KimPriceOrderProposal>(
      proposal,
      p => ({ ...p, deliveryDate: p?.proposalSupplier.dateDelivery, measureUnit: position.okeiItem?.symbol })
    ) : null;
  }

  isReviewed = (position: KimPriceOrderPosition) => position.proposals.some(({ isWinner }) => isWinner);

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.proposalsFooterRef.nativeElement.remove();
  }
}
