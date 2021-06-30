import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { PositionDocuments } from "../../common/models/position-documents";
import { RequestDocument } from "../../common/models/request-document";
import { FormDataService } from "../../../shared/services/form-data.service";
import { PositionStatus } from "../../common/enum/position-status";
import { RequestFilters } from "../../common/models/request-filters";

@Injectable({
  providedIn: "root"
})
export class PositionService {

  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  info(requestId: Uuid, positionId: Uuid) {
    const url = `requests/backoffice/${requestId}/positions/${positionId}/info`;
    return this.api.get<RequestPosition>(url);
  }

  changePositionsStatus(requestId: Uuid, positionIds: Uuid[], status: PositionStatus, role: string, useAllPositions?: boolean, statusComment?: string[], filters?: RequestFilters) {
    const url = `requests/${role}/positions/statuses/change`;
    return this.api.post<RequestPosition[]>(url, { requestId, positionIds, status, statusComment, useAllPositions, filters });
  }

  uploadDocuments(requestPosition: RequestPosition, files: File[]): Observable<RequestDocument[]> {
    const url = `requests/backoffice/${requestPosition.request.id}/positions/${requestPosition.id}/documents/upload`;
    return this.api.post<RequestDocument[]>(url, this.formDataService.toFormData({ files }));
  }

  documents(positionId: Uuid) {
    const url = `requests/backoffice/positions/${positionId}/documents`;
    return this.api.get<PositionDocuments>(url);
  }
}
