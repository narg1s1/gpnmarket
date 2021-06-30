import {Injectable} from "@angular/core";
import { PositionStatus } from "../enum/position-status";

@Injectable()
export class RequestPositionStatusService {
  private statuses = Object.keys(PositionStatus) as PositionStatus[];

  isStatusAfter(status: PositionStatus, compare: PositionStatus): boolean {
    return this.statuses.indexOf(status) > this.statuses.indexOf(compare);
  }

  isStatusPrevious(status: PositionStatus, compare: PositionStatus): boolean {
    return this.statuses.indexOf(status) < this.statuses.indexOf(compare);
  }

  getPrevStatus(status: PositionStatus): PositionStatus | undefined {
    const i = this.statuses.indexOf(status);

    return this.statuses[i - 1];
  }

  getNextStatus(status: PositionStatus): PositionStatus | undefined {
    const i = this.statuses.indexOf(status);

    return this.statuses[i + 1];
  }
}
