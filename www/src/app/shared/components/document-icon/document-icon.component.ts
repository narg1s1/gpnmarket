import { Component, Input } from '@angular/core';
import { DocumentIconSize } from "../../enums/document-icon-size";
import { DocumentExtension } from "../../enums/document-extensions";

@Component({
  selector: 'document-icon',
  templateUrl: 'document-icon.component.html'
})
export class DocumentIconComponent {
  @Input() name = "";
  @Input() size: DocumentIconSize = DocumentIconSize.medium;

  getExtension(): DocumentExtension {
    const documentExtension: DocumentExtension = Object.keys(DocumentExtension)
      .filter(extension => extension === this.name?.toLowerCase().split('.').pop())
      .map(extension => DocumentExtension[extension])
      .pop()
    ;

    return documentExtension || DocumentExtension.undefined;
  }
}
