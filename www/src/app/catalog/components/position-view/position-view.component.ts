import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { CatalogPosition } from "../../models/catalog-position";
import { CatalogService } from "../../services/catalog.service";
import { ActivatedRoute } from "@angular/router";
import { CartStoreService } from "../../../cart/services/cart-store.service";
import { ContragentInfo } from "../../../contragent/models/contragent-info";
import { ContragentService } from "../../../contragent/services/contragent.service";
import { CatalogCategoryAttribute } from "../../models/catalog-category-attribute";
import { Title } from "@angular/platform-browser";
import { tap } from "rxjs/operators";

@Component({
  selector: 'app-position-view',
  templateUrl: './position-view.component.html',
  styleUrls: ['./position-view.component.scss']
})
export class PositionViewComponent implements OnInit {
  position$: Observable<CatalogPosition>;
  attributes$: Observable<CatalogCategoryAttribute[]>;

  contragent: ContragentInfo;

  constructor(
    protected getContragentService: ContragentService,
    private catalogService: CatalogService,
    private route: ActivatedRoute,
    private cartStoreService: CartStoreService,
    private title: Title
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      const positionId = routeParams.positionId;
      this.position$ = this.catalogService.getPositionInfo(positionId).pipe(
        tap(position => this.title.setTitle(position.name))
      );
      this.attributes$ = this.catalogService.getPositionAttributes(positionId);
    });
  }

  onAddPositionToCart(position: CatalogPosition, quantity: number): Promise<boolean> {
    return this.cartStoreService.addItem(position, quantity);
  }

  isPositionInCart(position: CatalogPosition): boolean {
    return this.cartStoreService.isCatalogPositionInCart(position);
  }

  setValidQuantity(value, quantityEl): void {
    if (value <= 0 || value === "") {
      quantityEl.value = 1;
    }
  }
}
