import { UxgInputDirective } from './../input/uxg-input.directive';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, forwardRef, HostBinding, Inject, InjectionToken, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, QueryList, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { flatMap, mergeAll, startWith, takeUntil, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { UxgDropdownItemDirective } from "../dropdown/uxg-dropdown-item.directive";
import { UxgDropdownItem } from "../dropdown/uxg-dropdown-item";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'uxg-dropdown-input',
  templateUrl: './uxg-dropdown-input.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UxgDropdownInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => UxgDropdownInputComponent), multi: true }
  ]
})
export class UxgDropdownInputComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked, ControlValueAccessor, Validator {
  @ContentChildren(UxgDropdownItemDirective) items: QueryList<UxgDropdownItemDirective>;
  @ContentChild('errors', { read: TemplateRef }) errors: TemplateRef<ElementRef>;
  @HostBinding('class.app-dropdown') appDropdownClass = true;
  @HostBinding('class.app-control-wrap') @Input() appControlWrap = true;
  @HostBinding('class.app-dropdown-disabled') get isDisabled() { return this.is(this.disabled); }
  @ViewChild('itemsWrapper') itemsWrapperRef: ElementRef;
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('uxgInput') uxgInput: UxgInputDirective;
  @Output() select = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Input() hideAfterSelect = true;
  @Input() lg = false;
  @Input() placeholder = "";
  @Input() disabled: boolean;
  @Input() strictMode = false;
  @Input() warning = false;
  @Input() displayByFn: (value) => string;
  @Input() direction: "up" | "down";
  @Input() allowClear = false;
  @Input() required: boolean;
  @Input() preventUpdateOnInput = false;


  public inputValue = null;
  public value = null;
  private _isHidden = true;
  public onTouched: (value) => void;
  public onChange: (value) => void;
  public isNotFromList = false;
  public destroy$ = new Subject();

  private get focusedIndex() {
    return this.items.toArray().findIndex(item => item.isFocus);
  }

  get coords() {
    return this.inputRef.nativeElement.getBoundingClientRect();
  }

  get windowHeight() {
    return isPlatformBrowser(this.platformId) ? window.innerHeight : 0;
  }

  get scrollTop() {
    return isPlatformBrowser(this.platformId) ? window.pageYOffset : null;
  }

  get isDirectionUp() {
    if (this.itemsWrapper) {
      return this.direction === "up" || this.windowHeight < this.coords.bottom + this.itemsWrapper.offsetHeight;
    } else {
      return false;
    }
  }

  get itemsWrapper(): HTMLDivElement | null {
    return this.itemsWrapperRef ? this.itemsWrapperRef.nativeElement : null;
  }

  get isHidden(): boolean {
    return this._isHidden;
  }

  set isHidden(value: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      if (value) {
        window.removeEventListener('scroll', this.updatePositionOnScroll, true);
      } else {
        window.addEventListener('scroll', this.updatePositionOnScroll, true);
      }
    }
    this._isHidden = value;

    // Обновление классов элементов непосредственно в шаблоне срабатывает некорректно,
    // перенёс логику проставления классов сюда
    if (value) {
      this.itemsWrapperRef.nativeElement.classList.add('hidden');
      this.inputRef.nativeElement.classList.remove('active');
    } else {
      this.itemsWrapperRef.nativeElement.classList.remove('hidden');
      this.inputRef.nativeElement.classList.add('active');
    }
  }

  private keysActions: Record<KeyboardEvent["key"], () => void> = {
    'Enter': () => {
      if (this.focusedIndex !== -1) {
        this.items.toArray()[this.focusedIndex].click();
        this.inputRef.nativeElement.blur();
      }
    },
    'Escape': () => this.toggle(false),
    'ArrowDown': () => this.focusedIndex < this.items.length - 1 && this.items.toArray()[this.focusedIndex + 1].focus(),
    'ArrowUp': () => this.focusedIndex > 0 && this.items.toArray()[this.focusedIndex - 1].focus()
  };

  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  setDisabledState = isDisabled => this.disabled = isDisabled;
  writeValue = value => this.value = value;
  clickOut = (e: Event) => {
    if (!this.isHidden && !this.isInside(e.target)) {
      this.ngZone.run(() => this.toggle(false));
      this.cd.detectChanges();
    }
  }

  keyDown = (e: KeyboardEvent) => {
    if (!this.isHidden && this.isInside(e.target) && this.keysActions[e.key]) {
      e.preventDefault();
      this.ngZone.run(() => this.keysActions[e.key]());
      this.cd.detectChanges();
    }
  }

  updatePositionOnScroll = (e) => {
    if (!this.isHidden && !this.isInside(e.target)) {
      this.setPosition(this.itemsWrapper, this.isDirectionUp);
    }
  }

  constructor(
    @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    public el: ElementRef) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => this.document.addEventListener('click', this.clickOut));
      this.ngZone.runOutsideAngular(() => this.document.addEventListener('keydown', this.keyDown));
    }
  }


  ngAfterViewChecked() {
    this.setPosition(this.itemsWrapper, this.isDirectionUp);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.appendChild(this.itemsWrapper);
    }

    this.items.changes.pipe(
      startWith(this.items),
      flatMap(items => items.map(item => item.onSelect)),
      mergeAll<UxgDropdownItem>(),
      takeUntil(this.destroy$)
    )
      .subscribe(({label, value}) => {
        this.isNotFromList = false;
        this.writeValue(value);
        this.select.emit({ value, label });
        if (this.onChange) { this.onChange(value); }
        if (this.hideAfterSelect) { this.toggle(false); }
      });

    this.items.changes.pipe(
      startWith(this.items),
      flatMap(items => items.map((item: UxgDropdownItemDirective) => item.onFocus)),
      mergeAll<UxgDropdownItem>(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.items.forEach(({blur}) => blur()));

    this.focus.pipe(takeUntil(this.destroy$)).subscribe(() => this.toggle(this.items.length > 0));
  }

  toggle(state: boolean) {
    if (!this.is(this.disabled)) {
      this.isHidden = !state;
    }
  }

  input(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.isNotFromList = true;
    if (this.preventUpdateOnInput) {
      this.uxgInput.ngControl.control.setValue(value, {onlySelf: true});
      return;
    }
    this.items.forEach(({blur}) => blur());
    this.writeValue(value);

    if (this.onChange) {
      this.onChange(value);
    }
  }

  onBlur(e: Event) {
    this.uxgInput.ngControl.control.markAsDirty();
  }

  private is = (prop?: boolean | string) => prop !== undefined && prop !== false;

  private isInside(targetElement): boolean {
    return this.el.nativeElement.contains(targetElement) || this.itemsWrapper.contains(targetElement);
  }

  private setPosition(el, isDirectionUp: boolean = false): void {
    if (isDirectionUp) {
      this.renderer.setStyle(el, 'bottom', (this.windowHeight - this.scrollTop - this.coords.bottom + this.inputRef.nativeElement.offsetHeight - 2) + "px");
      this.renderer.removeStyle(el, 'top');
    } else {
      this.renderer.setStyle(el, 'top', (this.coords.top + this.scrollTop + this.inputRef.nativeElement.offsetHeight - 1) + "px");
      this.renderer.removeStyle(el, 'bottom');
    }

    this.renderer.setStyle(el, 'width', this.inputRef.nativeElement.offsetWidth + "px");
    this.renderer.setStyle(el, 'left', this.coords.left + "px");

    this.cd.detectChanges();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.strictMode !== false && this.isNotFromList && control.value) {
      return {"notFromList": true};
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener('click', this.clickOut);
      this.document.removeEventListener('keydown', this.keyDown);
      this.itemsWrapper.remove();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  clear() {
    this.writeValue(null);
    this.uxgInput.ngControl.control.setValue(null);
    this.uxgInput.onBlur();
    this.cd.detectChanges();
  }
}
