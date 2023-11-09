import { SignOut } from '@/auth/controllers/signout';
import { CookieHandler } from '@/global/helpers/cookie-handler';
import { authMockRequest, authMockResponse } from '@/root/mocks/auth.mock';
import { NextFunction, Request, Response } from 'express';

const USERNAME = 'Devant';
const PASSWORD = 'hd-pass';

describe('SignOut', () => {
  it('should clear the  cookie', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USERNAME,
        password: PASSWORD
      },
      null,
      {}
    ) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;
    const clearCookieSpy = jest.spyOn(res, 'clearCookie');
    const cookieHandlerSpy = jest.spyOn(CookieHandler, 'clearCookie');
    await SignOut.prototype.update(req, res, next);
    expect(cookieHandlerSpy).toBeCalledWith(res, 'token');
    expect(clearCookieSpy).toBeCalled();
  });
  it('should set correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USERNAME,
        password: PASSWORD
      },
      null,
      {}
    ) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;
    await SignOut.prototype.update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout Successful',
      user: {},
      token: ''
    });
  });
});
