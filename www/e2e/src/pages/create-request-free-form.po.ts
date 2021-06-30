import { by, element } from "protractor";

export class CreateRequestFreeFormPage {

  public static freeRequestButton() {
    return element(by.buttonText('Произвольная заявка'));
  }

  public static freeRequestNameInput() {
    return element(by.id('request-name'));
  }

  public static freeRequestCommentTextarea() {
    return element(by.id('comment-block-textarea'));
  }

  public static submitButton() {
    return element(by.buttonText('Отправить'));
  }
}
