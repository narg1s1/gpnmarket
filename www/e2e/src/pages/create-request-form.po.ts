import {by, element} from "protractor";

export class CreateRequestFormPage {
  public static individualRequestLink() {
    return element(by.linkText('Создать заявку'));
  }

  public static individualRequestTitle() {
    return element(by.tagName('h2'));
  }

  public static manualRequestButton() {
    return element(by.buttonText('Заполнить вручную'));
  }

  public static manualRequestLabels() {
    return element.all(by.className('clr-control-label'));
  }

  public static submitButton() {
    return element(by.buttonText('Отправить'));
  }

  public static requestNameInput() {
    return element(by.id('request-name'));
  }

  public static nameInput() {
    return element(by.id('name'));
  }

  public static productionDocumentInput() {
    return element(by.id('productionDocument'));
  }

  public static quantityInput() {
    return element(by.id('quantity'));
  }

  public static measureUnitInput() {
    return element(by.id('measureUnit'));
  }

  public static deliveryDateInput() {
    return element(by.id('deliveryDate'));
  }

  public static deliveryBasisInput() {
    return element(by.id('deliveryBasis'));
  }

  public static draftApplicationCreatedTitle() {
    return element(by.className('text-alert'));
  }

  public static okButton() {
    return element(by.buttonText('ОК'));
  }

  public static uploadDocumentButton() {
    return element(by.className('file-upload-label'));
  }

  public static uploadDocumentPath() {
    return element(by.css('input[type="file"]'));
  }
}
