import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { ContragentShortInfo } from "../../../../contragent/models/contragent-short-info";
import { FormBuilder, Validators } from "@angular/forms";
import { map, shareReplay } from "rxjs/operators";
import { ContragentService } from "../../../../contragent/services/contragent.service";
import { searchContragents } from "../../../helpers/search";
import { Observable } from "rxjs";
import { ContragentList } from "../../../../contragent/models/contragent-list";

@Component({
  selector: 'grid-contragent-form',
  templateUrl: 'grid-contragent-form.component.html'
})
export class GridContragentFormComponent implements OnChanges {
  @Input() excluded: ContragentShortInfo[];
  @Output() close = new EventEmitter();
  @Output() add = new EventEmitter();
  readonly form = this.fb.group({ supplier: [null, Validators.required] });
  readonly contragents$ = this.contragentService.getContragentList().pipe(shareReplay(1));
  readonly searchContragents = searchContragents;
  filteredContragents$: Observable<ContragentList[]>;

  constructor(private contragentService: ContragentService, private fb: FormBuilder) {}

  ngOnChanges({ excluded }: SimpleChanges) {
    if (excluded) {
      this.filteredContragents$ = this.contragents$.pipe(map(contragents => contragents.filter(c => !this.excluded.some(({ id }) => c.id === id))));
    }
  }

  submit() {
    if (this.form.invalid) { return; }
    this.add.emit(this.form.get('supplier').value);
  }

  getContragentName = ({ shortName, fullName }: ContragentShortInfo) => shortName || fullName;
}
