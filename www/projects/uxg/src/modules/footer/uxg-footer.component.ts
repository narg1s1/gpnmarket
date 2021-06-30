import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'uxg-footer',
  templateUrl: './uxg-footer.component.html',
  styleUrls: ['./uxg-footer.component.scss']
})
export class UxgFooterComponent {
  @HostBinding('class.hidden') @Input() hidden: boolean;
}
