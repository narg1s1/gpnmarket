import {browser, protractor} from "protractor";
import { Login, Role } from "../../login/login";
import {CreateRequestFormPage} from "../../../pages/create-request-form.po";
import {CreateRequestFreeFormPage} from "../../../pages/create-request-free-form.po";
import {CreateRequestForm} from "../create-request-form/create-request-form";
import {RequestViewPage} from "../../../pages/request-view.po";

const EC = protractor.ExpectedConditions;

describe('Создание заявки из xls-файла', () => {
  const login = new Login();
  const createRequest = new CreateRequestForm();
  const createRequestData = require("../../../test-data/create-request-data");

  beforeAll(() => {
    browser.get(browser.baseUrl);
    login.login(Role.CUSTOMER);
    CreateRequestFormPage.individualRequestLink().click();
    browser.wait(EC.visibilityOf(CreateRequestFormPage.individualRequestTitle()));
  });

  afterAll(() => {
    login.logout();
  });

  it('Заполнить поле Наименование заявки', () => {
    CreateRequestFreeFormPage.freeRequestNameInput().sendKeys(createRequestData.requestXls.requestName);
    expect(CreateRequestFreeFormPage.submitButton().getAttribute('disabled')).toBe('true');
  });

  it('Загрузка документа', () => {
    createRequest.uploadFile();
    expect(CreateRequestFormPage.submitButton().isEnabled()).toBe(true);
  });

  it('Нажать кнопку Отправить', () => {
    CreateRequestFreeFormPage.submitButton().click();
    browser.wait(EC.visibilityOf(CreateRequestFormPage.draftApplicationCreatedTitle()));
  });

  it('Нажать кнопку ОК в появившемся модальном окне', () => {
    expect(CreateRequestFormPage.draftApplicationCreatedTitle().getText()).toEqual('Черновик заявки создан');
    CreateRequestFormPage.okButton().click();
    browser.wait(EC.visibilityOf(RequestViewPage.requestNameTitle()));
    expect(browser.getCurrentUrl()).toContain(browser.baseUrl + '/requests/customer');
  });
});
