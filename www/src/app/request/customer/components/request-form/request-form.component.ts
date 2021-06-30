import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { Store } from "@ngxs/store";
import { catchError, finalize, flatMap, mapTo, takeUntil } from "rxjs/operators";
import { RequestService } from "../../services/request.service";
import { Subject, throwError } from "rxjs";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { RequestPosition } from "../../../common/models/request-position";
import { UxgModalComponent } from "uxg";
import { FeatureService } from "../../../../core/services/feature.service";

@Component({
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, OnDestroy {
  @ViewChild('recommendationModal') recommendationModal: UxgModalComponent;
  form: FormGroup;
  recommendedPositionsControl = this.formBuilder.control([]);
  destroy$ = new Subject();
  isLoading = false;
  recommendedPositions: Partial<RequestPosition>[];
  isRecommended = false;

  get formPositions() {
    return this.form.get('positions') as FormArray;
  }

  get validPositions() {
    return this.formPositions.controls.filter(({valid}) => valid);
  }

  constructor(
    private requestService: RequestService,
    private formBuilder: FormBuilder,
    private router: Router,
    public user: UserInfoService,
    public store: Store,
    public featureService: FeatureService
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      'name': [null, CustomValidators.requiredNotEmpty],
      'positions': this.formBuilder.array([], [Validators.required, Validators.minLength(1)]),
    });

    this.pushPosition();
  }

  pushPosition() {
    this.formPositions.push(this.formBuilder.control(null, Validators.required));
  }

  getRecommendedPositions() {
    this.isLoading = true;
    if (!this.isRecommended) {
      const {positions} = this.form.value;
      this.requestService.getRecommendedPositions(positions).pipe(
        catchError((e) => {
          this.submit();
          return throwError(e);
        })
      ).subscribe(
        (recPositions) => {
          if (recPositions.length !== 0 && recPositions?.[0]?.wantedCommodities?.length !== 0) {
            this.recommendedPositions = recPositions[0].wantedCommodities.map(item => {
                return {
                  name: item.name,
                  measureUnit: item.unit,
                  quantity: item.quantity,
                  deliveryDate: item.deliveryDate,
                  isDeliveryDateAsap: item.isDeliveryDateAsap,
                  deliveryBasis: item.deliveryBasis
                } as Partial<RequestPosition>;
              }
            );
            this.isLoading = false;
            this.recommendationModal.open();
            this.isRecommended = true;
          } else {
            this.submit();
          }
        }
      );
    } else {
      this.submit();
    }
  }

  addRecommendedPositions() {
    this.recommendedPositionsControl.value.forEach(
      recommendedPosition => {
        this.formPositions.push(
          this.formBuilder.control(recommendedPosition));
      });
    this.recommendationModal.close();
  }

  submit(publish = true) {
    const {name, positions} = this.form.value;
    let request$ = this.requestService.addRequest(name, positions);

    if (publish) {
      request$ = request$.pipe(
        flatMap(request => this.requestService.publishRequest(request.id).pipe(mapTo(request)))
      );
    }

    this.isLoading = true;
    this.form.disable();

    request$.pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.form.enable();
      })
    ).subscribe(data => {
      this.store.dispatch(new ToastActions.Success(publish ? "Заявка опубликована" : "Черновик заявки создан"));
      this.router.navigate(["requests/customer", data.id]);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
