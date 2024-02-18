import { authMockRequest, authMockResponse, authUserPayload } from '@/root/mocks/auth.mock';
import { NextFunction, Request, Response } from 'express';
import { CurrentUser } from '@/auth/controllers/current-user';
import { UserCache } from '@/service/redis/user.cache';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { existingUser } from '@/root/mocks/user.mock';

const USERNAME = 'Devant';
const PASSWORD = 'hd-pass';

describe('Singout', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token', () => {
    it('should set session token to null and send correct json response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      const next: NextFunction = {} as NextFunction;
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

      await CurrentUser.prototype.read(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null
      });
    });

    it('should set session token and send correct json response', async () => {
      const req: Request = authMockRequest({ token: '12djdj34' }, { username: USERNAME, password: PASSWORD }, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();

      const next: NextFunction = {} as NextFunction;
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await CurrentUser.prototype.read(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.cookies?.token,
        isUser: true,
        user: existingUser
      });
    });
  });
});
