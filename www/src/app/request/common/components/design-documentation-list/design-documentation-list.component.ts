import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Uuid } from "../../../../cart/models/uuid";
import { Request } from "../../models/request";
import { RequestService as BackofficeRequestService } from "../../../back-office/services/request.service";
import { RequestService as CustomerRequestService } from "../../../customer/services/request.service";
import { DesignDocumentationService } from "../../../back-office/services/design-documentation.service";
import { DesignDocumentationList } from "../../models/design-documentationList";
import { RequestPosition } from "../../models/request-position";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DesignDocumentation } from "../../models/design-documentation";
import { finalize, tap } from "rxjs/operators";
import { DesignDocumentationStatus } from "../../enum/design-documentation-status";
import { ClrLoadingState } from "@clr/angular";
import { Observable } from "rxjs";
import { DesignDocumentationType } from "../../enum/design-documentation-type";
import { RequestDocument } from "../../models/request-document";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { DesignDocumentationEdit } from "../../models/requests-list/design-documentation-edit";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { UxgBreadcrumbsService } from "uxg";
import { FeatureService } from "../../../../core/services/feature.service";

@Component({
  selector: 'app-request-design-documentation-list',
  templateUrl: './design-documentation-list.component.html',
  styleUrls: ['./design-documentation-list.component.scss']
})
export class DesignDocumentationListComponent implements OnInit {

  requestId: Uuid;
  request$: Observable<Request>;
  positions: RequestPosition[] = [];

  designDocumentations: DesignDocumentationList[] = [];
  documentationList: DesignDocumentation[];

  showDesignDocumentationListModal = false;
  addDocumentationForm: FormGroup;
  selectedPositions: RequestPosition[] = [];
  existingPositions: RequestPosition[] = [];
  designDocStatus = DesignDocumentationStatus;
  designDocumentationType = DesignDocumentationType;
  clrLoadingState = ClrLoadingState;

  private loadingDesignDocs: DesignDocumentation[] = [];
  private sendingForApproval: DesignDocumentationList[] = [];
  public designDocModels = [];
  public newDesignDocModels: {model: DesignDocumentationEdit, state: ClrLoadingState}[][] = [];

  get addDocumentationListForm() {
    return this.addDocumentationForm.get('addDocumentationListForm') as FormArray;
  }

  constructor(
    private bc: UxgBreadcrumbsService,
    private router: Router,
    private route: ActivatedRoute,
    private backofficeRequestService: BackofficeRequestService,
    private customerRequestService: CustomerRequestService,
    private designDocumentationService: DesignDocumentationService,
    private formBuilder: FormBuilder,
    public userInfoService: UserInfoService,
    public featureService: FeatureService,
  ) {
    this.addDocumentationForm = this.formBuilder.group({
      'addDocumentationListForm': this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');

    if (this.userInfoService.isBackOffice()) {
      this.request$ = this.backofficeRequestService.getRequest(this.requestId);
    }

    if (this.userInfoService.isCustomer()) {
      this.request$ = this.customerRequestService.getRequest(this.requestId);
    }

    this.request$ = this.request$.pipe(tap(request => {
      this.bc.breadcrumbs = [
        { label: "Заявки", link: this.router.createUrlTree(["../.."], { relativeTo: this.route }).toString() },
        { label: `Заявка №${request.number }`, link: this.router.createUrlTree([".."], { relativeTo: this.route }).toString() }
      ];
    }));

    this.getPositionList();
    this.getDesignDocumentationList();
  }

  onAddNext() {
    this.addDocumentationListForm.push(this.addDocumentationListFormGroup());
  }

  deleteItem(i): void {
    this.addDocumentationListForm.removeAt(i);
  }

  addDocumentationListFormGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, CustomValidators.simpleText]],
      adjustmentLimit: ['5', Validators.required],
      receivingLimit: ['15', Validators.required]
    });
  }

  isPositionIsChecked(position: RequestPosition) {
    return this.selectedPositions.indexOf(position) > -1;
  }

  onSelectPosition(position: RequestPosition) {
    const index = this.selectedPositions.indexOf(position);

    if (index === -1) {
      this.selectedPositions.push(position);
    } else {
      this.selectedPositions.splice(index, 1);
    }
  }

  isDesignDocModelInvalid(designDocModel: DesignDocumentationEdit) {
    return !designDocModel.name || !designDocModel.receivingLimit || !designDocModel.adjustmentLimit;
  }

  getPositionList() {
    this.designDocumentationService.getPositionList(this.requestId).subscribe(
      (positions: RequestPosition[]) => {
        this.positions = positions;
      }
    );
  }

  getPositions() {
    this.existingPositions = this.designDocumentations.map(element => {
      return element.position;
    });
    return this.positions.filter((x: RequestPosition) => {
      const foundPositions = this.existingPositions.filter((y: RequestPosition) => y.id === x.id);
      return foundPositions.length === 0;
    });
  }

  getDesignDocumentationList(): void {
    this.designDocumentationService.getDesignDocumentationList(this.requestId).subscribe(
      (data: DesignDocumentationList[]) => {
        this.designDocumentations = data;
        this.getPositions();
      }
    );
  }

  onShowDesignDocumentationListModal() {
    this.addDocumentationListForm.clear();
    this.addDocumentationListForm.push(this.addDocumentationListFormGroup());
    this.showDesignDocumentationListModal = true;
  }

  onAddDesignDocumentationList() {
    this.documentationList = this.addDocumentationListForm.value;
    this.designDocumentationService.addDesignDocumentationList(this.requestId,
      this.documentationList, this.selectedPositions).subscribe(
      (data: DesignDocumentationList[]) => {
        this.onCloseAddDesignDocumentationModal();
        this.designDocumentations = [...this.designDocumentations, ...data];
        this.getPositions();
      }
    );
  }

  onCloseAddDesignDocumentationModal() {
    this.selectedPositions = [];
    this.showDesignDocumentationListModal = false;
  }

  isLoadingDesignDoc(designDoc: DesignDocumentation): boolean {
    return this.loadingDesignDocs.filter(doc => doc === designDoc).length > 0;
  }

  isSendingForApproval(designDocumentationList: DesignDocumentationList): boolean {
    return this.sendingForApproval
      .filter(_designDocumentationList => designDocumentationList === _designDocumentationList).length > 0;
  }

  canUploadDocuments(designDoc: DesignDocumentation, designDocumentationList: DesignDocumentationList) {
    // Если мы бэкофис и загрузка еще не началась и не отправляем на согласование и можем отправить на согласование
    return this.featureService.authorize('addOrEditDesignDocuments')
      && !this.isLoadingDesignDoc(designDoc)
      && !this.isSendingForApproval(designDocumentationList)
      && this.canEditDesignDocList(designDocumentationList)
    ;
  }

  canEditDesignDocList(designDoc: DesignDocumentationList) {
    return [DesignDocumentationStatus.NEW, DesignDocumentationStatus.REJECTED].includes(designDoc.status);
  }

  canEditDesignDoc(designDocumentation: DesignDocumentationList, designDoc: DesignDocumentation) {
    return designDoc.type !== DesignDocumentationType.REMARK &&
      this.canEditDesignDocList(designDocumentation) &&
      this.featureService.authorize('addOrEditDesignDocuments');
  }

  isSendOnApproveActive(designDocList: DesignDocumentationList) {
    return designDocList.designDocs.filter(designDoc => designDoc.documents.length > 0).length > 0;
  }

  onSelectDocument(files: File[], designDoc: DesignDocumentation) {
    this.loadingDesignDocs.push(designDoc);
    const subscription = this.designDocumentationService
      .uploadDocuments(this.requestId, designDoc.id, files)
      .pipe(
        finalize(() => this.loadingDesignDocs = this.loadingDesignDocs.filter(doc => doc !== designDoc))
      )
      .subscribe(documents => {
        designDoc.documents = documents;
        subscription.unsubscribe();
      })
    ;
  }

  sendForApproval(designDocumentationList: DesignDocumentationList) {
    if (this.isSendingForApproval(designDocumentationList)) {
      return;
    }

    // По добавляем перечень из массив отправленных на согласование
    this.sendingForApproval.push(designDocumentationList);

    const subscription = this.designDocumentationService.sendForApproval(this.requestId, designDocumentationList.id)
      .pipe(
        finalize(() => {
          // По окончанию убираем перечень из массива отправленных на согласование
          this.sendingForApproval = this.sendingForApproval.filter(
            _designDocumentationList => designDocumentationList !== _designDocumentationList
          );
        })
      ).subscribe((_designDocumentationList: DesignDocumentationList) => {
        this.updateDesignDoc(designDocumentationList, _designDocumentationList);
        subscription.unsubscribe();
      })
    ;
  }

  approve(designDocumentationList: DesignDocumentationList) {
    const subscription = this.designDocumentationService
      .approve(this.requestId, designDocumentationList.id)
      .subscribe((_designDocumentationList: DesignDocumentationList) => {
        this.updateDesignDoc(designDocumentationList, _designDocumentationList);
        subscription.unsubscribe();
      });
  }

  reject(designDocumentationList: DesignDocumentationList, [file]: File[]) {
    const subscription = this.designDocumentationService
      .reject(this.requestId, designDocumentationList.id, file)
      .subscribe((_designDocumentationList: DesignDocumentationList) => {
        this.updateDesignDoc(designDocumentationList, _designDocumentationList);
        subscription.unsubscribe();
      });
  }

  updateDesignDoc(oldDoc: DesignDocumentationList, newDoc: DesignDocumentationList) {
    const i = this.designDocumentations.indexOf(oldDoc);

    if (i !== -1) {
      this.designDocumentations[i] = {...this.designDocumentations[i], ...newDoc};
    }
  }

  getRemark(designDocumentation: DesignDocumentationList): DesignDocumentation {
    return designDocumentation.designDocs.find(designDoc => designDoc.type === DesignDocumentationType.REMARK);
  }

  getAwaitingDoc(designDocumentation: DesignDocumentation): RequestDocument {
    return {
      id: null,
      filename: designDocumentation.name,
      created: (designDocumentation.adjustmentDate || "").toString(),
      comments: designDocumentation.comment,
      size: 0,
      user: null,
      extension: null,
      mime: null
    };
  }

  removeDesignDocumentList(request: Request, designDocumentationList: DesignDocumentationList) {
    this.designDocumentationService.removeDesignDocumentList(request.id, designDocumentationList.id)
      .subscribe(() => this.designDocumentations = this.designDocumentations.filter(designDocList => (
        designDocList !== designDocumentationList
      )));
  }

  removeDesignDocument(request: Request, designDocumentation: DesignDocumentation) {
    this.designDocumentationService.removeDesignDocument(request.id, designDocumentation.id)
      .subscribe(() => this.designDocumentations = this.designDocumentations.map(designDocList => (
        {...designDocList, designDocs: designDocList.designDocs.filter(designDoc => designDoc !== designDocumentation)}
      )));
  }

  removeDocuments(request: Request, designDoc: DesignDocumentation, documents: RequestDocument[]) {
    this.designDocumentationService.removeDocuments(request.id, designDoc.id, documents)
      .subscribe(() => designDoc.documents = designDoc.documents.filter(doc => !documents.includes(doc)))
    ;
  }

  getDesignDocModel(designDoc?: DesignDocumentation): DesignDocumentationEdit {
    const {id = null, name = "", receivingLimit = 15, adjustmentLimit = 5, comment = ""} = designDoc || {};

    return {id, name, receivingLimit, adjustmentLimit, comment};
  }

  editDesignDoc(request: Request, index, designDocList: DesignDocumentationList) {
    const designDocModel = this.designDocModels[index];
    this.designDocumentationService.editDesignDocument(request.id, designDocModel.id, designDocModel)
      .subscribe(data => {
        const i = designDocList.designDocs.findIndex(_designDoc => _designDoc.id === designDocModel.id);
        this.designDocModels[index] = null;
        designDocList.designDocs[i] = data;
      });
  }

  // Загружает документ в перечень. После загрузки удаляет поля ввода
  addDesignDoc(request: Request, designDocModel, designDocList: DesignDocumentationList, j: number, i: number) {
    this.newDesignDocModels[j][i].state = ClrLoadingState.LOADING;

    this.designDocumentationService.addDesignDocument(request.id, designDocList.id, designDocModel)
      .subscribe(designDoc => {
         this.newDesignDocModels[j][i].state = ClrLoadingState.SUCCESS;
        this.removeNewDesignDoc(j, i);
        designDocList.designDocs.push(designDoc);
      });
  }

  // Создаёт или добавляет поля ввода создания документа к перечню
  pushNewDesignDoc(j) {
    (this.newDesignDocModels[j] = this.newDesignDocModels[j] || [])
      .push({model: this.getDesignDocModel(), state: ClrLoadingState.DEFAULT});
  }

  // Удаляет поля ввода создания документа к перечню
  // j - индекс перечня РКД
  // i - индекс удаляемого поля
  removeNewDesignDoc(j, i) {
    this.newDesignDocModels[j].splice(i, 1);
  }

  isDateExpired(dateStr: string) {
    const date: Date = new Date(dateStr);
    return new Date() > date;
  }

  isDocumentsVisible(designDocumentation: DesignDocumentationList): boolean {
    return this.userInfoService.isBackOffice() || this.canEditDesignDocList(designDocumentation);
  }
}
