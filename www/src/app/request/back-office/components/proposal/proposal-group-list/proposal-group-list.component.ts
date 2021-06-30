import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ProposalGroup } from "../../../../common/models/proposal-group";
import { CommercialProposalsService } from "../../../services/commercial-proposals.service";
import { Uuid } from "../../../../../cart/models/uuid";
import { UxgBreadcrumbsService, UxgModalComponent } from "uxg";
import { Store } from "@ngxs/store";
import { Request } from "../../../../common/models/request";
import { FormBuilder, Validators } from "@angular/forms";
import { ProposalGroupFilter } from "../../../../common/models/proposal-group-filter";
import moment from "moment";
import { ProcedureAction } from "../../../models/procedure-action";
import { Procedure } from "../../../models/procedure";
import { ProposalSource } from "../../../enum/proposal-source";
import { FeatureService } from "../../../../../core/services/feature.service";
import { CommercialProposal } from "../../../../common/models/commercial-proposal";
import { RequestPosition } from "../../../../common/models/request-position";
import { ProposalSourceLabels } from "../../../../common/dictionaries/proposal-source-labels";
import { ContragentShortInfo } from "../../../../../contragent/models/contragent-short-info";

@Component({
  selector: 'app-common-proposal-group-list',
  templateUrl: './proposal-group-list.component.html',
  styleUrls: ['proposal-group-list.component.scss'],
})
export class ProposalGroupListComponent {
  @ViewChild('uploadTemplateModal') uploadTemplateModal: UxgModalComponent;
  @ViewChild('groupFormModal') groupFormModal: UxgModalComponent;
  @Input() request: Request;
  @Input() availablePositions: RequestPosition[];
  @Input() groups: ProposalGroup[];
  @Input() source = ProposalSource.COMMERCIAL_PROPOSAL;
  @Input() contragentsWithTp: ContragentShortInfo[];
  @Input() allowCreate: boolean;

  @Output() createGroup = new EventEmitter<{ name: string, requestPositions: Uuid[] }>();
  @Output() filter = new EventEmitter<ProposalGroupFilter>();
  @Output() newProcedure = new EventEmitter();
  @Output() uploadTemplate = new EventEmitter<{ files: File[], groupName: string}>();
  @Output() downloadTemplate = new EventEmitter();
  @Output() procedurePositionsSelected = new EventEmitter<Uuid[]>();
  @Output() filterAvailablePositions = new EventEmitter();

  requestId: Uuid;
  procedureModalPayload: ProcedureAction & { procedure?: Procedure };
  editedGroup: ProposalGroup;
  files: File[] = [];

  readonly form = this.fb.group({ requestPositionName: null, createdDateFrom: null, createdDateTo: null });
  readonly formTemplate = this.fb.group({ groupName: [null, [Validators.required]], files: [null, [Validators.required]] });
  readonly sourceLabel = ProposalSourceLabels;

  constructor(
    private bc: UxgBreadcrumbsService,
    private fb: FormBuilder,
    public featureService: FeatureService,
    public store: Store,
    public service: CommercialProposalsService
  ) {}

  emitFilter(filter: ProposalGroupFilter) {
    this.filter.emit({
      ...filter,
      createdDateFrom: filter.createdDateFrom ? moment(filter.createdDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD') : null,
      createdDateTo: filter.createdDateTo ? moment(filter.createdDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD') : null
    });
  }

  selectFiles(files: File[]): void {
    this.formTemplate.get('files').setValue(files);
  }

  submit() {
    if (this.formTemplate.valid) {
      this.uploadTemplateModal.close();
      this.uploadTemplate.emit(this.formTemplate.value);
    }
  }

  openForm(editedGroup?: ProposalGroup) {
    this.editedGroup = editedGroup;
    this.groupFormModal.open();
    this.filterAvailablePositions.emit({positionNameOrNumber: null, filters: {isOnlyNotInTcpGroup: true }});
  }

  trackById = (i, { id }: CommercialProposal | Procedure) => id;
}
