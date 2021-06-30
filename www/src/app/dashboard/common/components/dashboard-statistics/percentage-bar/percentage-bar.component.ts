import { Component, Input } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";

@Component({
  selector: 'app-percentage-bar',
  templateUrl: './percentage-bar.component.html',
  styleUrls: ['./percentage-bar.component.scss']
})
export class PercentageBarComponent {
  @Input() percentage: number;
  @Input() count: number;
  @Input() sum: number;

  getCurrencySymbol = getCurrencySymbol;
}
