import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { DesignDocumentation } from "../../common/models/design-documentation";
import { RequestDocument } from "../../common/models/request-document";
import { Observable } from "rxjs";
import { DesignDocumentationList } from "../../common/models/design-documentationList";
import { DesignDocumentationEdit } from "../../common/models/requests-list/design-documentation-edit";

@Injectable({
  providedIn: 'root'
})
export class DesignDocumentationService {

  constructor(
    protected api: HttpClient,
  ) {
  }

  getDesignDocumentationList(requestId: Uuid) {
    const url = `requests/${requestId}/designs`;
    return this.api.get<DesignDocumentationList[]>(url);
  }

  getPositionList(requestId: Uuid) {
    const url = `requests/${requestId}/designs/positions`;
    return this.api.get<RequestPosition[]>(url);
  }

  addDesignDocumentationList(requestId: Uuid, designDocs: DesignDocumentation[], positions: RequestPosition[]) {
    const url = `requests/${requestId}/designs/create`;
    const ids = [];
    for (const position of positions) {
      ids.push(position.id);
    }
    return this.api.post(url, {
      positions: ids,
      designDocs: designDocs
    });
  }

  uploadDocuments(requestId: Uuid, designDocId: Uuid, files: File[]): Observable<RequestDocument[]> {
    const url = `requests/${requestId}/designs/docs/${designDocId}/upload`;
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file, file.name));

    return this.api.post<RequestDocument[]>(url, formData);
  }

  sendForApproval(requestId: Uuid, designDocId: Uuid): Observable<DesignDocumentationList> {
    const url = `requests/${requestId}/designs/${designDocId}/send-for-approval`;

    return this.api.post<DesignDocumentationList>(url, null);
  }

  approve(requestId: Uuid, designDocId: Uuid): Observable<DesignDocumentationList> {
    const url = `requests/${requestId}/designs/${designDocId}/approve`;

    return this.api.post<DesignDocumentationList>(url, null);
  }

  reject(requestId: Uuid, designDocId: Uuid, file: File): Observable<DesignDocumentationList> {
    const url = `requests/${requestId}/designs/${designDocId}/reject`;
    const formData = new FormData();
    formData.append('remarksFile', file, file.name);

    return this.api.post<DesignDocumentationList>(url, formData);
  }

  // Удалить перечень
  removeDesignDocumentList(requestId: Uuid, designDocId: Uuid) {
    const url = `requests/${requestId}/designs/${designDocId}/remove`;

    return this.api.post<[]>(url, null);
  }

  // Удалить документ перечня
  removeDesignDocument(requestId: Uuid, designDocId: Uuid) {
    const url = `requests/${requestId}/designs/docs/${designDocId}/remove`;

    return this.api.post<[]>(url, null);
  }

  addDesignDocument(requestId: Uuid, designDocumentationListId: Uuid, body: DesignDocumentationEdit) {
    const url = `/requests/${requestId}/designs/${designDocumentationListId}/add-doc`;

    return this.api.post<DesignDocumentation>(url, body);
  }

  editDesignDocument(requestId: Uuid, designDocId: Uuid, body: DesignDocumentationEdit) {
    const url = `/requests/${requestId}/designs/docs/${designDocId}/edit`;

    return this.api.post<DesignDocumentation>(url, body);
  }

  // Удалить файлы документа перечня
  removeDocuments(requestId: Uuid, designDocId: Uuid, documents: RequestDocument[]) {
    const url = `requests/${requestId}/designs/docs/${designDocId}/remove-files`;
    const body = {
      documents: documents.map(document => document.id)
    };

    return this.api.post<DesignDocumentation>(url, body);
  }
}
