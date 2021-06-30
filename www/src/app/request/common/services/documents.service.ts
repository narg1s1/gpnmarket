import { AppFile, IFile } from './../../../shared/components/file/file';
import { HttpClient } from "@angular/common/http";
import { saveAs } from 'file-saver/src/FileSaver';
import { Injectable } from "@angular/core";
import { RequestDocument } from "../models/request-document";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(
    protected api: HttpClient,
  ) {
  }

  downloadFile(event: RequestDocument | IFile): void {
    const file = event;
    const fileName = file.filename;
    const fileId = file.id;
    this.api.post(
      `requests/documents/${fileId}/download`,
      {},
      {responseType: 'blob'})
      .pipe(first())
      .subscribe(data => {
        saveAs(data, fileName);
      });
  }

  downloadFileWithSign(event: RequestDocument): void {
    const file = event;
    const fileName = file.filename;
    const fileId = file.id;
    this.api.post(
      `requests/documents/${fileId}/download-with-sign`,
      {},
      {responseType: 'blob'})
      .subscribe(data => {
        saveAs(data, fileName);
      });
  }
}
