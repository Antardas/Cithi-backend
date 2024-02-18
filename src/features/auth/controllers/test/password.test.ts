import { Password } from '@/auth/controllers/password';
import { Request, Response } from 'express';
import { authMock, authMockRequest, authMockResponse } from '@/root/mocks/auth.mock';
import { CustomError } from '@/global/helpers/error-handler';
import { authService } from '@/service/db/auth.service';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { emailQueue } from '@/service/queues/email.queue';

const INVALID_EMAIL = 'test@exampl.com';

jest.mock('@/service/queues/email.queue');
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/db/auth.service');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is empty', () => {
      const req: Request = authMockRequest({}, { email: '' }, null, {}) as Request;
      const res: Response = authMockResponse();
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('"email" is not allowed to be empty');
      });
    });

    it('should throw "Invalid Credentials" if email is does not exist', () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }, null, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null as unknown as IAuthDocument);
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('Invalid Credentials');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }, null, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.create(req, res);

      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email Send Successfully'
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = authMockRequest({}, { password: '' }, null, {}) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.serializeError().message).toContain('Password is a required field');
        expect(error.statusCode).toEqual(400);
      });
    });

    it('should throw an error if password does not contain minimum length', () => {
      const req: Request = authMockRequest({}, { password: '123' }, null, {}) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.serializeError().message).toContain('Invalid password');
        expect(error.statusCode).toEqual(400);
      });
    });

    it('should throw an error if password exceed the maximum limit', () => {
      const req: Request = authMockRequest({}, { password: '123456789' }, null, {}) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.serializeError().message).toMatch('Invalid password');
        expect(error.statusCode).toEqual(400);
      });
    });

    it('should throw an error if password and confirmPassword not same', () => {
      const req: Request = authMockRequest({}, { password: '123456', confirmPassword: '1234567' }, null, {}) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.serializeError().message).toEqual('Passwords should match');
        expect(error.statusCode).toEqual(400);
      });
    });

    it('should throw error if reset token is expired', () => {
      const req: Request = authMockRequest({}, { password: '123456', confirmPassword: '123456' }, null, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null as unknown as IAuthDocument);
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.serializeError().message).toEqual('Reset Token has expired');
        expect(error.statusCode).toEqual(400);
      });
    });

    it('should send correct json response after update password', async () => {
      const req: Request = authMockRequest({}, { password: '123456', confirmPassword: '123456' }, null, {
        token: 'wMwUBff5546s54sf4SWdKsf'
      }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');

      await Password.prototype.update(req, res);

      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reset Password Successfully'
      });
    });
  });
});
