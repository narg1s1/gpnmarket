import { Store } from '@ngxs/store';
import { AppConfig } from './../../config/app.config';
import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2} from '@angular/core';
import { ToastActions } from '../actions/toast.actions';

@Directive({
  selector: '[appUploadFile][select]'
})
export class UploadFileDirective implements OnInit {
  @Output() select = new EventEmitter<File[]>();
  @Input() multiple: boolean;
  @Input() acceptedMimeTypes?: string[] = AppConfig.files.allowedMimeTypes;
  @Input() allowedExtensions?: string[] = AppConfig.files.allowedExtensions;
  inputEl: HTMLInputElement;

  constructor(private renderer: Renderer2, private el: ElementRef, private store: Store) {}

  ngOnInit() {
    this.inputEl = this.renderer.createElement("input");
    this.inputEl.setAttribute("type", "file");
    this.inputEl.multiple = this.multiple;
    this.inputEl.accept = this.acceptedMimeTypes.join(',');
    this.renderer.setStyle(this.inputEl, "display", "none");
    this.renderer.insertBefore(this.el.nativeElement.parentNode, this.inputEl, this.el.nativeElement.nextSibling);
    this.renderer.listen(this.inputEl, "change", this.onFileSelected);
  }

  @HostListener('click') click() {
    this.inputEl.click();
  }

  private onFileSelected = (e: Event) => {
    let deniedFileName = null;

    const files = Array.from((e.target as HTMLInputElement).files);

    const isDeniedFileExist = files.some((file: File) => {
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const isDeniedFile = !this.allowedExtensions.includes(fileExtension);
      if (isDeniedFile) {
        deniedFileName = file.name;
        return true;
      }
      return false;
    });

    if (isDeniedFileExist) {
      this.store.dispatch(new ToastActions.Error(`Загруженный файл ${deniedFileName} является недопустимым для загрузки.`));
    } else {
      this.select.emit(files);
    }

    this.inputEl.value = null;
  }
}
