import { SignIn } from '@/auth/controllers/signin';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { CustomError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { authMock, authMockRequest, authMockResponse } from '@/root/mocks/auth.mock';
import { authService } from '@/service/db/auth.service';
import { userService } from '@/service/db/user.service';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { Request, Response, NextFunction } from 'express';

const USERNAME = 'Devant';
const PASSWORD = 'hd-pass';
const WRONG_USERNAME = 'dev';
const WRONG_PASSWORD = 'hd';
const LONG_USERNAME = 'long-fake-username';
const LONG_PASSWORD = 'long-fake-password';

jest.useFakeTimers();
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/db/auth.service');

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        password: PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Username is a required field');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: WRONG_USERNAME,
        password: PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Invalid username');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: LONG_USERNAME,
        password: PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Invalid username');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USERNAME,
        password: ''
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Password is a required field');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USERNAME,
        password: WRONG_PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Invalid password');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });
  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USERNAME,
        password: LONG_PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(error.serializeError().message).toEqual('Invalid password');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });
  it('should throw "Invalid credentials" if username does not exist', () => {
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
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as unknown as IAuthDocument);

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLatterUpperCase(req.body.username));

      expect(error.serializeError().message).toEqual('username and password wrong');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should throw "Invalid credentials" if password does not match', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Devant',
        password: PASSWORD
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    const mockAuthUser: IAuthDocument = {
      ...authMock,
      comparePassword: jest.fn().mockResolvedValueOnce(false) // Simulate incorrect password
    } as unknown as IAuthDocument;

    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(mockAuthUser);

    SignIn.prototype.read(req, res, next).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLatterUpperCase(req.body.username));

      expect(mockAuthUser.comparePassword).toHaveBeenCalledWith(req.body.password);

      expect(error.serializeError().message).toEqual('username and password wrong');
      expect(error.serializeError().statusCode).toEqual(400);
    });
  });

  it('should set cookies data for valid credentials and send correct JSON response', async () => {
    // Prepare mock request, response, and next function
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, null, {}) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    // Mock the behavior of the authService.getAuthUserByUsername
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(authMock);

    // Mock the behavior of the existingUser.comparePassword
    jest.spyOn(authMock, 'comparePassword').mockResolvedValueOnce(true);

    // Mock the behavior of userService.getUserByAuthId
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValueOnce({ _id: '60263f14648fed5246e322d3' } as unknown as IUserDocument);

    // Call the read method of SignIn class
    await SignIn.prototype.read(req, res, next);

    // Assertions
    expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(req.body.username);
    expect(authMock.comparePassword).toHaveBeenCalledWith(req.body.password);
    expect(userService.getUserByAuthId).toHaveBeenCalledWith('60263f14648fed5246e322d3');
    const cookieSpy = jest.spyOn(res, 'cookie');
    const cookieArgs: unknown[] = [];

    // NOTE: It's used here cause I was getting error while directly trying to access index 2
    cookieSpy.mock.calls[0].forEach((callArgs, _index) => {
      cookieArgs.push(callArgs);
    });

    expect(res.cookie).toHaveBeenCalledWith(...cookieArgs);
    const user: Record<string, unknown> = {};
    Object.entries(authMock).forEach((item: [string, unknown]) => {
      if (typeof item[1] !== 'function') {
        user[item[0]] = item[1];
      }
    });

    expect(res.json).toHaveBeenCalledWith({
      message: 'User logged in successfully',
      user: user,
      token: cookieArgs[1]
    });
  });
});
