import { Inject, Injectable } from '@angular/core';
import { WsChatService } from "../../websocket/services/ws-chat.service";
import { HttpClient } from "@angular/common/http";
import { APP_CONFIG, GpnmarketConfigInterface } from "../../core/config/gpnmarket-config.interface";
import { FormDataService } from "../../shared/services/form-data.service";
import { tap } from "rxjs/operators";
import { ChatAttachment } from "../models/chat-attachment";
import { saveAs } from 'file-saver/src/FileSaver';

@Injectable({
  providedIn: 'root'
})
export class AttachmentsService {

  constructor(
    @Inject(APP_CONFIG) private appConfig: GpnmarketConfigInterface,
    private ws: WsChatService,
    private api: HttpClient,
    private formDataService: FormDataService) {
  }

  upload(file: File) {
    const url = `#chat#attachments/upload`;

    return this.api.post(url, this.formDataService.toFormData({ file }));
  }

  download({ id, originalFilename }: ChatAttachment) {
    const url = `#chat#attachments/file/${id}`;

    return this.api.get(url, { responseType: 'blob' }).pipe(tap(data => saveAs(data, originalFilename)));
  }
}
