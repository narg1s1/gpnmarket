import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { RequestService } from "../../services/request.service";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { Store } from "@ngxs/store";
import { finalize, flatMap, mapTo } from "rxjs/operators";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { Subject } from "rxjs";

@Component({
  selector: 'app-request-form-free',
  templateUrl: './request-form-free.component.html',
  styleUrls: ['./request-form-free.component.scss']
})
export class RequestFormFreeComponent implements OnDestroy {

  @Output() cancel = new EventEmitter();
  form = this.formBuilder.group({
    name: ['', CustomValidators.requiredNotEmpty],
    documents: [null, [Validators.minLength(1), Validators.required]],
    comments: ''
  });
  destroy$ = new Subject();
  isLoading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private requestService: RequestService,
    private store: Store,
    protected router: Router
  ) {
  }

  submit() {
    if (this.form.valid) {
      this.form.disable();
      this.isLoading = true;
      this.requestService.addFreeFormRequest(this.form.value)
        .pipe(
          flatMap(request => this.requestService.publishRequest(request.id).pipe(mapTo(request))),
          finalize(() => {
            this.form.enable();
            this.isLoading = false;
          })
        ).subscribe(({ id }) => {
        this.router.navigateByUrl(`requests/customer/${id}`);
        this.store.dispatch(new ToastActions.Success("Заявка опубликована"));
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
