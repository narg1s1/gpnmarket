import { IFile } from '../../../shared/components/file/file';
import { DocumentsService } from '../../../request/common/services/documents.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download-document',
  templateUrl: './download-document.component.html',
})
export class DownloadDocumentComponent implements OnInit {

  timeLeft = 5;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private documentService: DocumentsService
  ) { }

  ngOnInit() {
    const documentId = this.route.snapshot.params.id;
    const filename = this.route.snapshot.params.filename;

    this.documentService.downloadFile({id: documentId, filename: filename} as IFile);

    const timer = setInterval(() => {
      if (this.timeLeft > -1) {
        this.timeLeft = this.timeLeft - 1;
      } else {
        clearInterval(timer);
        this.router.navigate(['/']);
      }
    }, 1000);
  }
}
