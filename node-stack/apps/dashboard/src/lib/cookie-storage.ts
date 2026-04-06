import Cookies from "js-cookie";

export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

export class CookieTokenStorage implements TokenStorage {
  constructor(
    private cookieName: string = "token",
    private cookieOptions?: Cookies.CookieAttributes
  ) {}

  getToken(): string | null {
    return Cookies.get(this.cookieName) || null;
  }

  setToken(token: string): void {
    Cookies.set(this.cookieName, token, this.cookieOptions);
  }

  removeToken(): void {
    Cookies.remove(this.cookieName);
  }
}