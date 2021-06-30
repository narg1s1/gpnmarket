import { by, element } from 'protractor';

export class LoginPage {
  public static welcomeMessage() {
    return element(by.className('welcome-msg'));
  }

  public static reqLink() {
    return element(by.className('registration'));
  }

  public static forgotPasswordLink() {
    return element(by.className('forgot-password'));
  }

  public static usernameInput() {
    return element(by.className('email'));
  }

  public static passwordInput() {
    return element(by.className('password'));
  }

  public static loginButton() {
    return element(by.buttonText('Войти'));
  }

  public static requestListTitle() {
    return element(by.tagName('h1'));
  }

  public static usernameButton() {
    return element(by.className('user-name'));
  }

  public static logoutButton() {
    return element(by.buttonText('Выход'));
  }

  public static menuItems () {
    return element.all(by.className('nav-link'));
  }
}
