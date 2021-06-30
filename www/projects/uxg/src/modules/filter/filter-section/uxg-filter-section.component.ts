import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'uxg-filter-section',
  templateUrl: './uxg-filter-section.component.html',
  styleUrls: ['./uxg-filter-section.component.scss']
})
export class UxgFilterSectionComponent implements OnInit {
  @HostBinding('class.disabled')
  @Input() disabled: boolean;
  @Input() label: string;
  showed: boolean;

  ngOnInit() {
    this.showed = this.disabled !== undefined ? !this.disabled : true;
  }
}
