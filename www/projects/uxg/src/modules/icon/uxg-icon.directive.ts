import { Directive, ElementRef, Inject, InjectionToken, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { UxgIcons } from "./uxg-icons";
import { UxgIconService } from "./uxg-icon.service";
import { isPlatformBrowser } from "@angular/common";

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'uxg-icon',
  // tslint:disable-next-line:no-host-metadata-property
  host: { 'class': 'app-icon' }
})

export class UxgIconDirective implements OnInit, OnDestroy {
  @Input() shape: keyof typeof UxgIcons;
  @Input() size;
  private svg: SVGSVGElement;
  private readonly mutation$ = isPlatformBrowser(this.platformId) && new MutationObserver(() => this.update());

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
    private el: ElementRef,
    private service: UxgIconService, private zone: NgZone
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.update();
      this.mutation$.observe(this.el.nativeElement, { attributes: true });
    }
  }

  private update() {
    this.zone.runOutsideAngular(() => {
      const el: HTMLElement = this.el.nativeElement;
      const getProp = (prop, val?) => el.getAttribute(prop) ?? this[prop] ?? val;
      const shape = getProp("shape").split(" ").shift();
      const svgString = this.service.get(shape);
      if (svgString) {
        this.svg = this.svgFromString(svgString);
        const size = getProp('size', this.svg.attributes.getNamedItem("viewBox")?.value.split(" ").pop());

        if (size) {
          this.svg.setAttribute("width", size);
          this.svg.setAttribute("height", size);
        }

        while (el.firstChild) {
          el.removeChild(el.lastChild);
        }
        el.appendChild(this.svg);
      }
    });
  }

  private svgFromString(string: string): SVGSVGElement {
    return new DOMParser().parseFromString(string, "image/svg+xml").documentElement as unknown as SVGSVGElement;
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.mutation$.disconnect();
    }
  }
}
