import {Injectable} from '@angular/core';

const TOKEN_KEY = 'AuthToken';
const TOKEN_TYPE_KEY = 'AuthTokenType';

/**
 * Класс для управления токеном авторизации. Сохраняет и достаёт из localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() {
  }

  public saveToken(token: string, tokenType: string) {
    const storage = this.getStorage();

    storage.setItem(TOKEN_KEY, token);
    storage.setItem(TOKEN_TYPE_KEY, tokenType);
  }

  public getToken(): string | null {
    return this.getStorage().getItem(TOKEN_KEY);
  }

  public getTokenType(): string | null {
    return this.getStorage().getItem(TOKEN_TYPE_KEY);
  }

  public signOut() {
    const storage = this.getStorage();

    storage.removeItem(TOKEN_KEY);
    storage.removeItem(TOKEN_TYPE_KEY);
    storage.clear();
  }

  private getStorage() {
    return window.localStorage;
  }
}
