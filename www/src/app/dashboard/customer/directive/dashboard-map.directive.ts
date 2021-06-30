import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import * as L from 'leaflet';
import { LatLngExpression, Map } from 'leaflet';

@Directive({ selector: '[appDashboardMap]' })
export class DashboardMapDirective implements AfterViewInit {

  @Input() center: LatLngExpression;
  @Input() zoom: number;
  @Input() scrollWheelZoom: boolean;
  @Input() zoomControl: boolean;
  @Output() initMap = new EventEmitter<Map>();

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    const map = L.map(this.el.nativeElement, {
      center: this.center,
      zoomControl: this.zoomControl,
      scrollWheelZoom: this.scrollWheelZoom,
      zoom: this.zoom
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    this.initMap.emit(map);
    this.initMap.complete();
  }
}
