import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RequestDocument } from "../../../models/request-document";

@Component({
  selector: 'app-position-document-card',
  templateUrl: './position-document-card.component.html',
  styleUrls: ['./position-document-card.component.scss']
})
export class PositionDocumentCardComponent {
  @Output() upload = new EventEmitter<File[]>();
  @Input() canUpload: boolean;
  @Input() documents: RequestDocument[];
  @Input() disabled: boolean;
  @Input() label: string;
  folded: boolean;
}
