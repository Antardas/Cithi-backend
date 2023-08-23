import { SignUp } from '@/auth/controllers/signup';
import { Request, Response, NextFunction } from 'express';
import * as cloudinaryUploads from '@/global/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@/root/mocks/auth.mock';
import { CustomError } from '@/global/helpers/error-handler';
import { authService } from '@/service/db/auth.service';
import { UserCache } from '@/service/redis/user.cache';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';

jest.useFakeTimers();
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/queues/auth.queue');
jest.mock('@/service/queues/user.queue');
jest.mock('@/global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
        email: 'antardas2334@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username exceed the maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antar-das',
        email: 'antardas2334@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid username');
    });
  });
  it('should throw an error if username do not have minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ant',
        email: 'antardas2334@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid username');
    });
  });
  it('should throw an error if email did not provide', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: '',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });
  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 'antardas2334gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email must be valid');
    });
  });
  it('should throw an error if email is not string', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 12345 as unknown as string,
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email must be of type string');
    });
  });

  it('should throw an error if password is not provided', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 'antardas2334@gmail.com',
        password: '',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password does not meet minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 'antardas2334@gmail.com',
        password: '123',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if avatarColor is not provided', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 'antardas2334@gmail.com',
        password: '123456',
        avatarColor: '',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Avatar color is required');
    });
  });

  it('should throw an error if avatarImage is not provided', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'antard',
        email: 'antardas2334@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage: ''
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Avatar image is required');
    });
  });

  it('should throw an error is user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'devant',
        email: 'dev.antardas@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res, next).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid Credentials');
    });
  });

  it('should set cookies data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'devans',
        email: 'dev.antardas1@gmail.com',
        password: '123456',
        avatarColor: 'blue',
        avatarImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
      },
      null,
      {}
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = {} as NextFunction;

    jest
      .spyOn(authService, 'getUserByUsernameOrEmail')
      .mockResolvedValue(null as unknown as IAuthDocument);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    const cookieSpy = jest.spyOn(res, 'cookie');
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (): any => Promise.resolve({ version: '568977875', public_id: 'devans' })
    );
    await SignUp.prototype.create(req, res, next);
    const cookieArgs: unknown[] = [];

    // NOTE: It's used here cause I was getting error while directly trying to access index 2
    cookieSpy.mock.calls[0].forEach((callArgs, _index) => {
      // console.log(`Call ${index + 1}:`, callArgs);
      cookieArgs.push(callArgs);
    });
    expect(res.cookie).toHaveBeenCalledWith(cookieArgs[0], cookieArgs[1], cookieArgs[2]);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User Created Successfully',
      user: userSpy.mock.calls[0][2],
      token: cookieArgs[1]
    });
  });
});
