import { Toast } from "../models/toast";
import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { ToastActions } from "../actions/toast.actions";
import { insertItem, patch, removeItem } from "@ngxs/store/operators";
import { filter, switchMap, takeUntil, tap } from "rxjs/operators";
import { Subject, timer } from "rxjs";

export interface ToastStateModel {
  toasts: Toast[];
}

type Model = ToastStateModel;
type Context = StateContext<Model>;

@State<Model>({
  name: 'Toast',
  defaults: { toasts: [] }
})
@Injectable()
export class ToastState {
  readonly holdUp$ = new Subject();

  @Selector()
  static toasts({toasts}: Model) {
    return toasts;
  }

  static toastsLimit(display) {
    return createSelector([ToastState], ({toasts}: Model) => toasts.slice(0, display));
  }

  @Action(ToastActions.Push)
  push({setState, dispatch}: Context, {toast}: ToastActions.Push) {
    setState(patch({ toasts: insertItem(toast) }));

    return timer(toast.lifetime).pipe(
      filter(() => toast.lifetime > 0),
      switchMap(() => dispatch(new ToastActions.Remove(toast))),
      takeUntil(this.holdUp$.pipe(filter(_toast => _toast === toast)))
    );
  }

  @Action(ToastActions.Remove)
  remove({setState}: Context, {toast}: ToastActions.Remove) {
    return setState(patch({
      toasts: removeItem(_toast => _toast === toast)
    }));
  }

  @Action(ToastActions.Hold)
  hold(ctx: Context, action: ToastActions.Hold) {
    this.holdUp$.next(action.toast);
  }

  @Action(ToastActions.Release)
  release({dispatch}: Context, {toast}: ToastActions.Release) {
    return timer(toast.lifetime).pipe(
      filter(() => toast.lifetime > 0),
      switchMap(() => dispatch(new ToastActions.Remove(toast))),
      takeUntil(this.holdUp$.pipe(filter(_toast => _toast === toast)))
    );
  }
}
