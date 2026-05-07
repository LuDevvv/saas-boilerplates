import Cookies from "js-cookie";

export class CookieTokenStorage {
  private readonly ACCESS_TOKEN_KEY = "token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";

  constructor(
    private cookieOptions?: Cookies.CookieAttributes
  ) {}

  getToken(): string | null {
    return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
  }

  getRefreshToken(): string | null {
    return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  setToken(token: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(this.ACCESS_TOKEN_KEY, token, { ...this.cookieOptions, ...options });
  }

  setRefreshToken(token: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(this.REFRESH_TOKEN_KEY, token, { ...this.cookieOptions, ...options });
  }

  removeToken(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}

export const cookieTokenStorage = new CookieTokenStorage({
  secure: window.location.protocol === "https:",
  sameSite: "lax",
  path: "/",
  expires: 90, // Days
});