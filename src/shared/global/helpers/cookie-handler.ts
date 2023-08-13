import { config } from '@/root/config';
import { Response, CookieOptions } from 'express';

export class CookieHandler {
  private static getDefaultOptions(): CookieOptions {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000) // Default expiration time (1 hour)
    };

    if (config.NODE_ENV === 'production') {
      defaultOptions.secure = true;
      defaultOptions.sameSite = 'none';
    }

    return defaultOptions;
  }

  static setCookie(res: Response, key: string, value: string, options?: CookieOptions) {
    const cookieOptions: CookieOptions = { ...this.getDefaultOptions(), ...options };
    res.cookie(key, value, cookieOptions);
  }

  static clearCookie(res: Response, key: string, options?: CookieOptions) {
    const cookieOptions: CookieOptions = {
      ...this.getDefaultOptions(),
      expires: new Date(0), // Expire immediately to delete the cookie,
      ...options
    };

    res.clearCookie(key, cookieOptions);
  }
}
