import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appUploadFile][dropFile]'
})
export class UploadFileDragDirective {
  @Output() dropFile = new EventEmitter<File[]>();
  @Input() hoverClass = "hover";

  constructor(private el: ElementRef) {}

  @HostListener("dragover", ["$event"])
  public onDragOver(e: Event & { dataTransfer: DataTransfer }) {
    e.preventDefault();
    e.stopPropagation();
    this.el.nativeElement.classList.add(this.hoverClass);
  }

  @HostListener("dragleave", ["$event"])
  public onDragLeave(e: Event & { dataTransfer: DataTransfer }) {
    e.preventDefault();
    e.stopPropagation();
    this.el.nativeElement.classList.remove(this.hoverClass);
  }

  @HostListener('drop', ['$event'])
  public onDrop(e: Event & { dataTransfer: DataTransfer }) {
    e.preventDefault();
    e.stopPropagation();
    this.el.nativeElement.classList.remove(this.hoverClass);

    this.dropFile.emit(Array.from(e.dataTransfer.files));
  }
}
