import { Component, Host, Input } from '@angular/core';
import { UxgFilterDirective } from "../uxg-filter.directive";

@Component({
  selector: 'uxg-filter-button',
  templateUrl: './uxg-filter-button.component.html',
  styleUrls: ['./uxg-filter-button.component.scss']
})
export class UxgFilterButtonComponent {

  @Input() uxgFilter: UxgFilterDirective;

  get filter(): UxgFilterDirective {
    return (this._filter?.el && this._filter) || this.uxgFilter;
  }

  constructor(@Host() public _filter: UxgFilterDirective) {}
}
