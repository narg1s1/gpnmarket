import { LoginPage } from '../../pages/login.po';
import {browser, by, element, protractor} from "protractor";
import { Login, Role } from "./login";

const loginData = require("../../test-data/login-data");

describe('Логин', () => {

  const EC = protractor.ExpectedConditions;
  const login = new Login();

  beforeEach(() => {
    browser.get(browser.baseUrl);
  });

  it('Отображение страница логина', () => {
    expect(LoginPage.welcomeMessage().getText()).toEqual('Добро пожаловать');
    expect(LoginPage.reqLink().getText()).toEqual(('Регистрация'));
    expect(LoginPage.forgotPasswordLink().getText()).toEqual('Забыли пароль?');
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/auth/login');
  });

  it('Успешный логин бэкофисом', () => {

    login.login(Role.BACKOFFICE);
    browser.wait(EC.visibilityOf(element(by.tagName('h1'))), 5000);

    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/requests/backoffice');
    expect(LoginPage.menuItems().getText()).toEqual(loginData.backoffice.menuItems);
    expect(LoginPage.usernameButton().getText()).toEqual(browser.params.login.backoffice.user);
  });

  it('Успешный выход бэкофисом', () => {
    login.logout();
    expect(LoginPage.welcomeMessage().getText()).toEqual('Добро пожаловать');
  });

  fit('Успешный логин заказчиком', () => {
    login.login(Role.CUSTOMER);
    browser.wait(EC.visibilityOf(LoginPage.requestListTitle()));
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/dashboard');
    expect(LoginPage.menuItems().getText()).toEqual(loginData.customer.menuItems);
    expect(LoginPage.usernameButton().getText()).toEqual(browser.params.login.customer.user);
  });

  fit('Успешный выход заказчиком', () => {
    login.logout();
    expect(LoginPage.welcomeMessage().getText()).toEqual('Добро пожаловать');
  });
});
