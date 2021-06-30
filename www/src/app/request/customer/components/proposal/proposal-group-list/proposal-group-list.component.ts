import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProposalGroup } from "../../../../common/models/proposal-group";
import { Request } from "../../../../common/models/request";
import { FormBuilder } from "@angular/forms";
import { ProposalGroupFilter } from "../../../../common/models/proposal-group-filter";
import moment from "moment";

@Component({
  selector: 'app-common-proposal-group-list',
  templateUrl: './proposal-group-list.component.html',
  styleUrls: ['proposal-group-list.component.scss'],
})
export class ProposalGroupListComponent {
  @Input() request: Request;
  @Input() groups: ProposalGroup[];
  @Output() filter = new EventEmitter<ProposalGroupFilter>();
  readonly form = this.fb.group({ requestPositionName: null, createdDateFrom: null, createdDateTo: null });

  constructor(private fb: FormBuilder) {}

  emitFilter(filter: ProposalGroupFilter) {
    this.filter.emit({
      ...filter,
      createdDateFrom: filter.createdDateFrom ? moment(filter.createdDateFrom, 'DD.MM.YYYY').format('YYYY-MM-DD') : null,
      createdDateTo: filter.createdDateTo ? moment(filter.createdDateTo, 'DD.MM.YYYY').format('YYYY-MM-DD') : null
    });
  }
}
