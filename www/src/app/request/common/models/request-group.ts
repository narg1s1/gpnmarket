import {RequestPositionList} from "./request-position-list";
import {RequestPosition} from "./request-position";

export class RequestGroup extends RequestPositionList {
  /**
   * Значение null допустимо для позиций не сохранённых в базе данных
   */
  name: string;
  positions: (RequestPosition | RequestGroup)[];
}
