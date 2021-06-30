import {CreateRequestFormPage} from "../../../pages/create-request-form.po";
import * as path from "path";

const requestData = require("../../../test-data/create-request-data");
const fileToUpload = '../../../files/RequestTemplate.xlsx',
  absolutePath = path.resolve(__dirname, fileToUpload);

export class CreateRequestForm {

  createRequestForm() {
    CreateRequestFormPage.individualRequestLink().click();
    CreateRequestFormPage.manualRequestButton().click();
    CreateRequestFormPage.requestNameInput().sendKeys(requestData.requestForm.requestName);
    CreateRequestFormPage.nameInput().sendKeys(requestData.requestForm.name);
    CreateRequestFormPage.productionDocumentInput().sendKeys(requestData.requestForm.productionDocument);
    CreateRequestFormPage.quantityInput().sendKeys(requestData.requestForm.quantity);
    CreateRequestFormPage.measureUnitInput().sendKeys(requestData.requestForm.measureUnit);
    CreateRequestFormPage.deliveryDateInput().sendKeys(requestData.requestForm.deliveryDate);
    CreateRequestFormPage.deliveryBasisInput().sendKeys(requestData.requestForm.deliveryBasis);
    this.uploadFile();
  }

  uploadFile() {
    CreateRequestFormPage.uploadDocumentButton().click();
    CreateRequestFormPage.uploadDocumentPath().sendKeys(absolutePath);
  }
}
