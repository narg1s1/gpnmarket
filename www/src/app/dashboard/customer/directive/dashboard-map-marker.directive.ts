import { Directive, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { LatLngExpression, Marker } from 'leaflet';

@Directive({ selector: '[appDashboardMapMarker]' })
export class DashboardMapMarkerDirective implements OnInit {
  @Input() type;
  @Input() coords: LatLngExpression;
  @Input() iconSize: [number, number];
  @Input() iconAnchor: [number, number];
  @Output() initMarker = new EventEmitter<Marker>();
  @HostBinding('class') get class() {
    return `dashboard-map-marker-${this.type}`;
  }
  @HostBinding('class.dashboard-map-marker') dashboardMapMarker = true;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const icon = L.divIcon({
      className: null,
      iconSize: this.iconSize,
      iconAnchor: this.iconAnchor,
      html: this.el.nativeElement
    });

    this.initMarker.emit(L.marker(this.coords, { icon }));
    this.initMarker.complete();
  }
}
