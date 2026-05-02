import Cookies from "js-cookie";

export class CookieTokenStorage {
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

export const cookieTokenStorage = new CookieTokenStorage("token", {
  secure: window.location.protocol === "https:",
  sameSite: "lax",
  expires: 7,
  path: "/",
});