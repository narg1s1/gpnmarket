import { by, element } from "protractor";

export class RequestViewPage {

  public static requestNameTitle() {
    return element(by.className('request-name'));
  }
}
