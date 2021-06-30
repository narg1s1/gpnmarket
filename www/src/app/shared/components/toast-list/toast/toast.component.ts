import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { Toast } from "../../../models/toast";
import { Store } from "@ngxs/store";
import { ToastActions } from "../../../actions/toast.actions";
import Release = ToastActions.Release;
import Hold = ToastActions.Hold;
import Remove = ToastActions.Remove;

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  @Input() toast: Toast;

  @HostListener('click')
  click() {
    return this.toast.removeOnClick && this.store.dispatch(new Remove(this.toast));
  }

  @HostListener('mouseenter')
  hold() {
    this.store.dispatch(new Hold(this.toast));
  }

  @HostListener('mouseleave')
  release() {
    if (this.toast.lifetime) {
      this.store.dispatch(new Release(this.toast));
    }
  }

  constructor(private store: Store) {}

}
