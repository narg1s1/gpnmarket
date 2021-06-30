import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { RequestDocument } from "../../../request/common/models/request-document";
import { Guid } from "guid-typescript";
import { DocumentsService } from "../../../request/common/services/documents.service";
import { DocumentIconSize } from "../../enums/document-icon-size";

/**
 * Компонент для отображение списка документов и загрузки новых документов в этот список
 *
 * Используется для отображения списка уже загруженных документов!
 */
@Component({
  selector: 'app-document-simple-list',
  templateUrl: './document-simple-list.component.html',
  styleUrls: ['./document-simple-list.component.scss']
})
export class DocumentSimpleListComponent {

  @Input() documents: RequestDocument[] = [];

  @Input() uploadLabel = 'Загрузить';

  @Input() enableDelete = false;
  @Input() enableUpload = true;
  @Input() uploadedDateHidden = false;
  @Input() showUploadedTime = false;
  @Input() sizeInfoHidden = false;
  @Input() gridable = false;
  @Input() limit = 0;
  @Input() size: DocumentIconSize = DocumentIconSize.medium;

  @Output() selected = new EventEmitter<File[]>();
  @Output() delete = new EventEmitter<RequestDocument>();
  @ViewChild('uploadEl') uploadElRef: ElementRef;
  showAll = false;

  constructor(
    private documentsService: DocumentsService
  ) {}

  onDeleteDocument(document: RequestDocument) {
    this.delete.emit(document);
  }

  onDownloadDocument(document: RequestDocument) {
    if (!document.id) {
      return;
    }
    this.documentsService.downloadFile(document);
  }

  onChangeDocuments(files: File[]) {
    this.selected.emit(files);

    // очищаем, чтобы можно было снова загрузить тот же файл
    this.uploadElRef.nativeElement.value = '';
  }

  getDocuments() {
    // Если showAll=true или не указан limit возвращаем всё.
    return this.documents.slice(0, this.showAll ? this.documents.length : (this.limit || this.documents.length));
  }
}
