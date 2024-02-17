import { FollowerCache } from '@/service/redis/follower.cache';
import { PostCache } from '@/service/redis/post.cache';
import { UserCache } from '@/service/redis/user.cache';
import { postService } from '@/service/db/post.service';
import { userService } from '@/service/db/user.service';
import { followerService } from '@/service/db/follower.service';
import { authMockRequest, authMockResponse, authUserPayload } from '@/root/mocks/auth.mock';
import { Request, Response } from 'express';
import { existingUser } from '@/root/mocks/user.mock';
import { mockFollowerData } from '@/root/mocks/follow.mock';
import { Get } from '../get-profile';
import mongoose from 'mongoose';
import { postMockData } from '@/root/mocks/post.mock';
import { Helpers } from '@/global/helpers/helpers';
import { Update } from '../update';
import { CustomError } from '@/global/helpers/error-handler';
import { authService } from '@/service/db/auth.service';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { emailQueue } from '@/service/queues/email.queue';
import { UPDATE_SOCIAL_LINKS_TO_DB, userQueue, UPDATE_NOTIFICATIONS_SETTINGS_TO_DB } from '@/service/queues/user.queue';

jest.mock('@/service/redis/post.cache');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/db/post.service');
jest.mock('@/service/db/user.service');
jest.mock('@/service/db/auth.service');
jest.mock('@/service/db/follower.service');
jest.mock('@/service/queues/base.queue');

describe('Update', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  describe('password', () => {
    it('should throw an error if currentPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '',
          newPassword: '123456',
          confirmPassword: '123456'
        },
        authUserPayload,
        {},
        {}
      ) as unknown as Request;
      const res: Response = authMockResponse();
      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if newPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '1234567',
          newPassword: '',
          confirmPassword: '123456'
        },
        authUserPayload,
        {},
        {}
      ) as unknown as Request;
      const res: Response = authMockResponse();
      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('Password is a required field | Confirm password does not match new password.');
      });
    });

    it('should throw an error if confirmPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '1234567',
          newPassword: '123456',
          confirmPassword: ''
        },
        authUserPayload,
        {},
        {}
      ) as unknown as Request;
      const res: Response = authMockResponse();
      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('Confirm password does not match new password.');
      });
    });

    it('should throw an error if currentPassword does not exist', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '1234567',
          newPassword: '123456',
          confirmPassword: '123456'
        },
        authUserPayload,
        {},
        {}
      ) as unknown as Request;
      const res: Response = authMockResponse();
      const mockUser: IAuthDocument = {
        ...existingUser,
        comparePassword: async () => Promise.resolve(false)
      } as unknown as IAuthDocument;
      jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser);

      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('Invalid credentials');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '1234567',
          newPassword: '123456',
          confirmPassword: '123456'
        },
        authUserPayload,
        {},
        {}
      ) as unknown as Request;
      const res: Response = authMockResponse();
      const mockUser: IAuthDocument = {
        ...existingUser,
        comparePassword: async () => Promise.resolve(true),
        hashPassword: () => 'SOME_HASH_TOKEN'
      } as unknown as IAuthDocument;
      jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser);
      jest.spyOn(userService, 'updatePassword');
      const spy = jest.spyOn(emailQueue, 'addEmailJob');

      await Update.prototype.password(req, res);
      expect(userService.updatePassword).toHaveBeenCalledWith(`${req.currentUser!.userId}`, 'SOME_HASH_TOKEN');
      expect(emailQueue.addEmailJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password changed adn you will redirect to login page shortly'
      });
    });
  });

  describe('basicInfo', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}, {}) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');
      jest.spyOn(UserCache.prototype, 'updateBasicInfo');
      await Update.prototype.basicInfo(req, res);
      expect(UserCache.prototype.updateBasicInfo).toHaveBeenCalledWith(`${req.currentUser?.userId}`, basicInfo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the basic info'
      });
    });

    it('should call updateBasicInfoInDB', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}, {}) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Update.prototype.basicInfo(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('UPDATE_BASIC_INFO_TO_DB', {
        key: `${req.currentUser?.userId}`,
        value: basicInfo
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the basic info'
      });
    });
  });

  describe('socialLinks', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}, {}) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSocialLinks');

      await Update.prototype.socialLinks(req, res);
      expect(UserCache.prototype.updateSocialLinks).toHaveBeenCalledWith(`${req.currentUser?.userId}`, socialInfo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the social link'
      });
    });

    it('should call updateSocialLinksInDB', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}, {}) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Update.prototype.socialLinks(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith(UPDATE_SOCIAL_LINKS_TO_DB, {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the social link'
      });
    });
  });

  describe('notificationSettings', () => {
    it('should call "addUserJob" methods', async () => {
      const settings = {
        messages: true,
        reactions: false,
        comments: true,
        follows: false
      };
      const req: Request = authMockRequest({}, settings, authUserPayload, {}, {}) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'updateNotificationSetting');
      jest.spyOn(userQueue, 'addUserJob');

      await Update.prototype.notificationSettings(req, res);
      expect(UserCache.prototype.updateNotificationSetting).toHaveBeenCalledWith(`${req.currentUser?.userId}`,  settings);
      expect(userQueue.addUserJob).toHaveBeenCalledWith(UPDATE_NOTIFICATIONS_SETTINGS_TO_DB, {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Update the notification settings successfully', data: req.body });
    });
  });
});
