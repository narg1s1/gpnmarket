import { browser, protractor } from "protractor";
import { CreateRequestFormPage } from "../../../pages/create-request-form.po";
import { Login, Role } from "../../login/login";
import { CreateRequestForm } from "./create-request-form";
import { RequestViewPage } from "../../../pages/request-view.po";

const createRequestData = require("../../../test-data/create-request-data");
const EC = protractor.ExpectedConditions;

describe('Создание заявки вручную при заполнении всех обязательных полей', () => {
  const login = new Login();
  const createRequest = new CreateRequestForm();

  beforeAll(() => {
    browser.get(browser.baseUrl);
    login.login(Role.CUSTOMER);
  });

  afterAll(() => {
    login.logout();
  });

  it('Нажать на пункт меню Создать заявку', () => {
    CreateRequestFormPage.individualRequestLink().click();
    browser.wait(EC.visibilityOf(CreateRequestFormPage.individualRequestTitle()));
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/requests/create');
    expect(CreateRequestFormPage.individualRequestTitle().getText()).toEqual('Создать заявку');
  });

  it('Нажать на вкладку Заполнить вручную', () => {
    CreateRequestFormPage.manualRequestButton().click();
    expect(CreateRequestFormPage.manualRequestLabels().getText()).toEqual(createRequestData.fieldsLabel);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Наименование заявки', () => {
    CreateRequestFormPage.requestNameInput().sendKeys(createRequestData.requestForm.requestName);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Наименования МТР', () => {
    CreateRequestFormPage.nameInput().sendKeys(createRequestData.requestForm.name);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Документ, в соответствии с которым необходимо изготовление (НТД: ГОСТ/ТУ, ТЗ, ОЛ, ЗТП и т.п.)', () => {
    CreateRequestFormPage.productionDocumentInput().sendKeys(createRequestData.requestForm.productionDocument);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Количество', () => {
    CreateRequestFormPage.quantityInput().sendKeys(createRequestData.requestForm.quantity);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Единицы измерения', () => {
    CreateRequestFormPage.measureUnitInput().sendKeys(createRequestData.requestForm.measureUnit);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Необходимый срок поставки', () => {
    CreateRequestFormPage.deliveryDateInput().sendKeys(createRequestData.requestForm.deliveryDate);
    expect(CreateRequestFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Заполнить поле Базис поставки (пункт, до которого требуется доставка)', () => {
    CreateRequestFormPage.deliveryBasisInput().sendKeys(createRequestData.requestForm.deliveryBasis);
    expect(CreateRequestFormPage.submitButton().isEnabled()).toBe(true);
  });

  it('Загрузка документа', () => {
    createRequest.uploadFile();
  });

  it('Нажать кнопку Отправить', () => {
    CreateRequestFormPage.submitButton().click();
    browser.wait(EC.visibilityOf(CreateRequestFormPage.draftApplicationCreatedTitle()));
  });

  it('Нажать кнопку ОК в появившемся модальном окне', () => {
    expect(CreateRequestFormPage.draftApplicationCreatedTitle().getText()).toEqual('Черновик заявки создан');
    CreateRequestFormPage.okButton().click();
    browser.wait(EC.visibilityOf(RequestViewPage.requestNameTitle()));
    expect(browser.getCurrentUrl()).toContain(browser.baseUrl + '/requests/customer');
  });
});
