import HTTP_STATUS from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import { CookieHandler } from '@/global/helpers/cookie-handler';

export class SignOut {
  public async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    console.log(req.cookies);

    req.session = null;
    res.clearCookie('session');
    CookieHandler.clearCookie(res, 'token');
    res.status(HTTP_STATUS.OK).json({
      message: 'Logout Successful',
      user: {},
      token: ''
    });
  }
}
