import { HttpClient } from "@angular/common/http";
import { saveAs } from 'file-saver/src/FileSaver';
import { Injectable } from "@angular/core";
import { RequestDocument } from "../../request/common/models/request-document";

@Injectable({
  providedIn: 'root'
})
export class ContractDocumentsService {

  constructor(
    protected api: HttpClient,
  ) {
  }

  downloadFile(event: RequestDocument, contractId): void {
    const file = event;
    const fileName = file.filename;
    const fileId = file.id;

    this.api.post(
      `requests/supplier/contracts/${contractId}/documents/${fileId}/download`,
      {},
      {responseType: 'blob'})
      .subscribe(data => {
        saveAs(data, fileName);
      });
  }
}
