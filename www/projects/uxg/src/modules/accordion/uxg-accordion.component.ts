import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, AfterContentInit } from '@angular/core';

@Component({
  selector: 'uxg-accordion',
  templateUrl: './uxg-accordion.component.html',
  styleUrls: ['./uxg-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UxgAccordionComponent implements OnInit, AfterContentInit {

   @Input() isOpened = false;
   @Input() isShowBorder = false;

   @Output() toggle: EventEmitter<any> = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {}

  ngAfterContentInit() {
    this.cdr.detectChanges();
  }

}
