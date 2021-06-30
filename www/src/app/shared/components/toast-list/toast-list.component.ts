import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { Toast } from "../../models/toast";
import { Select } from "@ngxs/store";
import { ToastState } from "../../states/toast.state";
import { Observable } from "rxjs";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-toast-list',
  templateUrl: './toast-list.component.html',
  styleUrls: ['./toast-list.component.scss'],
  animations: [trigger('animateDestroy', [transition(':leave', animate('300ms ease', style({ opacity: '0', height: '0' })))])],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastListComponent {
  @Select(ToastState.toastsLimit(5))
  readonly toasts$: Observable<Toast[]>;
}
