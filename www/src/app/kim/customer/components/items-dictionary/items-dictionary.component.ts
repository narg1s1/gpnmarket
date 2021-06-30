import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import { ItemsDictionaryState } from "../../states/items-dictionary.state";
import { ItemsDictionaryActions } from "../../actions/items-dictionary.actions";
import Search = ItemsDictionaryActions.Search;
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { KimDictionaryItem } from "../../../common/models/kim-dictionary-item";
import { ActivatedRoute, Router } from "@angular/router";
import Clear = ItemsDictionaryActions.Clear;
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { filter, takeUntil } from "rxjs/operators";
import { CartActions } from "../../actions/cart.actions";

@Component({
  selector: 'app-items-dictionary',
  templateUrl: './items-dictionary.component.html',
  styleUrls: ['./items-dictionary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsDictionaryComponent implements OnInit, OnDestroy {
  @Select(ItemsDictionaryState.itemsDictionary) itemsDictionary$: Observable<KimDictionaryItem[]>;
  @Select(ItemsDictionaryState.status) status$: Observable<StateStatus>;
  searchText = new FormControl();
  form = new FormGroup({});

  readonly destroy$ = new Subject();

  get formItemsDictionary(): FormArray {
    return this.form.get('itemsDictionary') as FormArray;
  }

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(({ query }) => {
        if (query) {
          return this.store.dispatch(new Search(query));
        } else {
          this.store.dispatch(new Clear());
        }
      }
    );
    this.itemsDictionary$.pipe(
      filter(p => !!p),
      takeUntil(this.destroy$)
    ).subscribe((itemsDictionary) => {
      this.form.removeControl("itemsDictionary");
      this.form.addControl("itemsDictionary", this.fb.array(
        itemsDictionary.map((itemDictionary) => {
          const formGroup = this.fb.group({
            itemDictionary,
            quantity: [1, [Validators.required, Validators.min(0.0001)]],
          });
          if (formGroup.get('itemDictionary').hasError('inCart')) {
            formGroup.get('quantity').disable();
          }
          return formGroup;
        }))
      );
    });
  }

  addItem(formGroup: AbstractControl) {
    const { itemDictionary, quantity } = formGroup.value;
    this.store.dispatch(new CartActions.AddItem(itemDictionary, quantity)).subscribe(
      (result) => {
        const e = result.error as any;
        this.store.dispatch(e ?
          new ToastActions.Error(e && e?.error?.detail) : new ToastActions.Success('Позиция добавлена в корзину')
        );
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
