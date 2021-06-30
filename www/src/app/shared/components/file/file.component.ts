import { DocumentsService } from './../../../request/common/services/documents.service';
import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { UxgPopoverComponent, UxgPopoverContentDirection } from "uxg";
import { AppFile } from "./file";

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent {
  @ViewChild('popover') popover: UxgPopoverComponent;
  @Input() appFile: AppFile;
  @Input() size: "m" | "s" = 'm';
  @Input() disableDelete = false;
  @Input() removable = true;
  @Input() downloadable = false;
  @Output() delete = new EventEmitter();

  readonly direction = UxgPopoverContentDirection;

  constructor(private documentService: DocumentsService) {}

  @HostListener('mouseover')
  showPopover() {
    this.popover?.show();
  }

  @HostListener('mouseout')
  hidePopover() {
    this.popover?.hide();
  }

  map(extensions: string[]) {
    return extensions?.map(ext => '*.' + ext).join(', ');
  }

  downloadFile() {
    this.documentService.downloadFile(this.appFile.file);
  }
}
