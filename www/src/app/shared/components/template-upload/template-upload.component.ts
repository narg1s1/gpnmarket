import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AppFile } from "../file/file";

@Component({
  selector: 'app-template-upload',
  templateUrl: './template-upload.component.html',
  styleUrls: ['./template-upload.component.scss']
})
export class TemplateUploadComponent {
  @Input() invalid: boolean;

  documents: File[] = [];
  appFiles: AppFile[] = [];

  @Output() fileSelected = new EventEmitter<File[]>();
  @ViewChild('uploadEl') uploadElRef: ElementRef;

  addDocument(files: File[]) {
    const appFiles = files.map(file => new AppFile(file, ['xls', 'xlsx']));
    this.documents.push(...appFiles.filter(({ valid }) => valid).map(({ file }) => file));
    this.appFiles.push(...appFiles);
    this.onChangeDocuments();
  }

  removeDocument(appFile: AppFile, i) {
    this.appFiles.splice(i, 1);
    i = this.documents.indexOf(appFile.file);

    if (i !== -1) {
      this.documents.splice(i, 1);
    }

    this.onChangeDocuments();
  }

  onChangeDocuments() {
    this.fileSelected.emit(this.documents);
  }

  /**
   * Открывает окно для выбора файлов
   */
  open() {
    this.uploadElRef.nativeElement.click();
  }

  clear() {
    this.documents = [];
  }
}
