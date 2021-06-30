import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppFile } from "../file/file";

/**
 * Компонент для отображения и выбора файлов для последующей загрузки на сервер
 *
 * Используется для отображения списка еще НЕ загруженных файлов!
 */
@Component({
  selector: 'app-document-upload-list',
  templateUrl: './document-upload-list.component.html',
  styleUrls: ['./document-upload-list.component.scss']
})
export class DocumentUploadListComponent implements OnInit {

  @Input() documents: File[] = [];
  @Input() uploadLabel = 'Выбрать документ';
  @Input() hideUploadedListTitle = false;
  @Input() dragAndDropAvailable = false;
  @Input() uploadAvailable = true;
  @Input() removable = true;
  @Input() downloadable = false;
  @Input() allowed: string[];
  @Input() denied: string[];
  @Output() fileSelected = new EventEmitter<{ files: File[] }>();
  @ViewChild('uploadEl') uploadElRef: ElementRef;
  appFiles: AppFile[] = [];

  ngOnInit() {
    this.appFiles = this.documents?.map(file => new AppFile(file, this.allowed));
  }

  addDocument(files: File[]) {
    this.appFiles.push(...files.map(file => new AppFile(file, this.allowed)));
    this.onChangeDocuments();
  }

  removeAppFile(appFile: AppFile) {
    this.appFiles = this.appFiles.filter((item) => item !== appFile);
    this.onChangeDocuments();
  }

  onChangeDocuments() {
    const files = this.appFiles.filter(file => file.valid).map(({ file }) => file);

    this.fileSelected.emit({files: files});
  }

  clear() {
    this.documents = [];
  }
}
