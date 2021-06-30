import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Select, Store } from "@ngxs/store";
import { CartState } from "../../../customer/states/cart.state";
import { Observable } from "rxjs";
import { KimCartItem } from "../../models/kim-cart-item";
import { StateStatus } from "../../../../request/common/models/state-status";
import { CartActions } from "../../../customer/actions/cart.actions";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  templateUrl: './kim.component.html',
  styleUrls: ['./kim.component.scss']
})
export class KimComponent implements AfterViewInit, OnDestroy, OnInit {
  @Select(CartState.cartItems) cartItems$: Observable<KimCartItem[]>;
  @Select(CartState.cartItemsLength) cartItemsLength$: Observable<number>;
  @Select(CartState.status) status$: Observable<StateStatus>;

  @ViewChild('menu') menu: ElementRef;
  isNavigationEnd: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public router: Router,
    public cd: ChangeDetectorRef,
    public store: Store
  ) {
  }

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.isNavigationEnd = true);
  }

  ngAfterViewInit() {
    const contentEl = this.document.querySelector('.app-content');
    contentEl.parentElement.insertBefore(this.menu.nativeElement, contentEl);

    this.store.dispatch(new CartActions.Fetch());
  }

  ngOnDestroy() {
    this.menu.nativeElement.remove();
  }

}
