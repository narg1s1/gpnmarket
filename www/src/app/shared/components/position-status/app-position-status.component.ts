import { Component, Input } from '@angular/core';
import { PositionStatus } from "../../../request/common/enum/position-status";

@Component({
  selector: 'app-position-status',
  templateUrl: './app-position-status.component.html'
})
export class AppPositionStatusComponent {
  @Input() status: PositionStatus;
  @Input() type?: string;
  @Input() label: string;
  @Input() count: number;
  @Input() textAlign: "left" | "right" = "right";
}
