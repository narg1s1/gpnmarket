import { takeUntil } from 'rxjs/operators';
import { OnDestroyDirective } from 'src/app/request/common/components/on-destroy.component';
import { Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { RequestPosition } from "../../../models/request-position";
import { History } from "../../../models/history";
import * as moment from "moment";
import { PositionHistoryType } from "../../../enum/position-history-type";
import { Uuid } from "../../../../../cart/models/uuid";
import { PositionInfoFieldsLabels } from "../../../dictionaries/position-info-fields-labels";
import { ContragentInfo } from "../../../../../contragent/models/contragent-info";
import { ContragentService } from "../../../../../contragent/services/contragent.service";
import { RequestPositionService } from "../../../services/request-position.service";
import { PositionCancelReason } from "../../../enum/position-cancel-reason";
import { PositionCancelReasonLabels } from "../../../dictionaries/position-cancel-reason-labels";

@Component({
  selector: 'app-request-position-history',
  templateUrl: './position-history.component.html',
  styleUrls: ['./position-history.component.scss']
})
export class PositionHistoryComponent extends OnDestroyDirective implements OnInit, OnChanges {

  @Input() requestPosition: RequestPosition;

  contragent: ContragentInfo;
  contragentInfoModalOpened = false;
  history: History[];

  constructor(
    private getContragentService: ContragentService,
    private positionService: RequestPositionService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnInit() {
    this.getHistory();
  }

  getHistory(): void {
    this.positionService.getHistory(this.requestPosition)
      .pipe(takeUntil(this.destroy$))
      .subscribe((history: History[]) => {
        this.history = history;
      });
  }

  isDocumentUploadAction(activityItem: History): boolean {
    return (
      [
        PositionHistoryType.DOC_POSITION.valueOf(),
        PositionHistoryType.DOC_OFFER.valueOf(),
        PositionHistoryType.DOC_TECHPROPOSALS.valueOf(),
        PositionHistoryType.DOC_MESSAGE.valueOf(),
        PositionHistoryType.DOC_CONTRACT.valueOf(),
        PositionHistoryType.DOC_MANUFACTURING.valueOf(),
      ].indexOf(activityItem.type) !== -1
    );
  }

  downloadDocument(documentId: Uuid, documentName: string): void {
    this.positionService.downloadFileFromHistory(documentId, documentName);
  }

  showContragentInfo(event: MouseEvent, contragentId: Uuid): void {
    // При клике не даём открыться ссылке из href, вместо этого показываем модальное окно
    event.preventDefault();

    this.contragentInfoModalOpened = true;

    if (!this.contragent || this.contragent.id !== contragentId) {
      this.contragent = null;

      const subscription = this.getContragentService
        .getContragentInfo(contragentId)
        .subscribe(contragentInfo => {
          this.contragent = contragentInfo;
          subscription.unsubscribe();
        });
    }
  }

  isPositionEditAction(activityItem: History): boolean {
    return activityItem.type === PositionHistoryType.POSITION_EDITED.valueOf();
  }

  /**
   * Функция определяет относится ли активность к типу смены статуса или добавления позиции
   * @param activityItem
   */
  isStatusChangeAction(activityItem: History): boolean {
    return (
      [
        PositionHistoryType.POSITION_STATUS.valueOf(),
        PositionHistoryType.OFFER_STATUS.valueOf(),
        PositionHistoryType.WINNER_STATUS.valueOf(),
        PositionHistoryType.CONTRACT_STATUS.valueOf(),
        PositionHistoryType.POSITION_TECHNICAL_PROPOSAL_STATUS.valueOf(),
        PositionHistoryType.DESIGN_STATUS.valueOf(),
        PositionHistoryType.POSITION_TECHNICAL_COMMERCIAL_PROPOSAL_STATUS.valueOf()
      ].indexOf(activityItem.type) !== -1
    );
  }

  /**
   * Функция определяет относится ли активность к типу выбора победителя
   * @param activityItem
   */
  isPositionWinnerSelectedAction(activityItem: History): boolean {
    return activityItem.type === PositionHistoryType.WINNER_ADDED.valueOf();
  }

  /**
   * Функция определяет относится ли активность к типу удаления победителя
   * @param activityItem
   */
  isPositionWinnerRemovedAction(activityItem: History): boolean {
    return activityItem.type === PositionHistoryType.WINNER_REMOVED.valueOf();
  }

  getCurrentStatusClass(activityItem: History) {
    const positionStatus = this.isStatusChangeAction(activityItem) ?
      activityItem.data.oldStatus : activityItem.status;
    const activityType = activityItem.type || '';

    return 'position-current-status-' + positionStatus + ' activity-type-' + activityType;
  }

  getStatusCommentLabel(comment: string): string {
    return comment in PositionCancelReason ? PositionCancelReasonLabels[comment] : comment;
  }

  getNewStatusClass(activityItem: History) {
    const positionStatus = this.isStatusChangeAction(activityItem) ?
      activityItem.data.newStatus : activityItem.status;
    const activityType = activityItem.type || '';

    return 'position-new-status-' + positionStatus + ' activity-type-' + activityType;
  }

  /**
   * Функция приводит возвращаемые данные редактирования позиции в более удобный для фронта вид
   * @param data
   */
  getPositionEditInfoList(data): Array<{ label: string, oldValue: any, newValue: any }> {
    const positionEditInfo = [];

    Object.entries(data.oldValues).forEach(([key, value]) => {

      let oldValue = value;
      let newValue = data.newValues[key];

      if (key === 'deliveryDate') {
        oldValue = value ? moment(value).format('DD.MM.YYYY') : 'как можно скорее';
        newValue = newValue ? moment(newValue).format('DD.MM.YYYY') : 'как можно скорее';
      }

      if (key === 'isDeliveryDateAsap') {
        oldValue = (value === false) ? 'Нет' : 'Да';
        newValue = (value === false) ? 'Да' : 'Нет';
      }

      positionEditInfo.push({
        'label': this.getEditedFieldLabel(key),
        'oldValue': oldValue,
        'newValue': newValue
      });
    });

    return positionEditInfo;
  }

  getEditedFieldLabel(field: string): string {
    return PositionInfoFieldsLabels.hasOwnProperty(field) ? PositionInfoFieldsLabels[field] : '';
  }
}
