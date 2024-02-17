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

jest.mock('@/service/redis/follower.cache');
jest.mock('@/service/redis/post.cache');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/db/post.service');
jest.mock('@/service/db/user.service');
jest.mock('@/service/db/follower.service');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('all', () => {
    it('should send success json response if users in cache', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        {},
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUsersFromCache').mockResolvedValue([existingUser]);
      jest.spyOn(UserCache.prototype, 'getTotalUsersFromCache').mockResolvedValue(1);
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([mockFollowerData]);
      await Get.prototype.all(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`followers:${req.currentUser!.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get users',
        data: {
          users: [existingUser],

          followers: [mockFollowerData],
          totalUser: 1
        }
      });
    });

    it('should send success json response if users in database', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        {},
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUsersFromCache').mockResolvedValue([]);
      jest.spyOn(UserCache.prototype, 'getTotalUsersFromCache').mockResolvedValue(0);
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowersData').mockResolvedValue([mockFollowerData]);
      jest.spyOn(userService, 'getAllUsers').mockResolvedValue([existingUser]);
      jest.spyOn(userService, 'getTotalUserFromDB').mockResolvedValue(1);

      await Get.prototype.all(req, res);
      expect(followerService.getFollowersData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser!.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get users',
        data: {
          users: [existingUser],
          followers: [mockFollowerData],
          totalUser: 1
        }
      });
    });
  });

  describe('profile', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
      await Get.prototype.profile(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile',
        data: existingUser
      });
    });

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);

      await Get.prototype.profile(req, res);
      expect(userService.getUserById).toHaveBeenCalledWith(`${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile',
        data: existingUser
      });
    });
  });

  describe('profileAndPosts', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
      jest.spyOn(PostCache.prototype, 'getUserPostsFromCache').mockResolvedValue([postMockData]);

      await Get.prototype.profileAndPost(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`);
      expect(PostCache.prototype.getUserPostsFromCache).toHaveBeenCalledWith('post', parseInt(req.params.uId, 10));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile and posts',
        data: {
          user: existingUser,
          posts: [postMockData]
        }
      });
    });

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
      jest.spyOn(PostCache.prototype, 'getUserPostsFromCache').mockResolvedValue([]);
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);

      const userName: string = Helpers.firstLatterUpperCase(req.params.username);

      await Get.prototype.profileAndPost(req, res);
      expect(userService.getUserById).toHaveBeenCalledWith(existingUser._id);
      expect(postService.getPosts).toHaveBeenCalledWith({ username: userName }, 0, 100, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile and posts',
        data: {
          user: existingUser,
          posts: [postMockData]
        }
      });
    });
  });

  describe('profileByUserId', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Get.prototype.profileUserId(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile by id',
        data: existingUser
      });
    });

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
      jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);

      await Get.prototype.profileUserId(req, res);
      expect(userService.getUserById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user profile by id',
        data: existingUser
      });
    });
  });

  describe('randomUserSuggestions', () => {
    it('should send success json response if user in cache', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getRandomUsersFromCache').mockResolvedValue([existingUser]);

      await Get.prototype.randomUsersSuggestion(req, res);
      expect(UserCache.prototype.getRandomUsersFromCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, `${req.currentUser?.username}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user suggestions',
        data: [existingUser]
      });
    });

    it('should send success json response if user in database', async () => {
      const req: Request = authMockRequest(
        {},
        {},
        authUserPayload,
        { username: existingUser.username, id: existingUser._id, uId: existingUser.uId },
        {
          page: '1'
        }
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getRandomUsersFromCache').mockResolvedValue([]);
      jest.spyOn(userService, 'getRandomUsers').mockResolvedValue([existingUser]);

      await Get.prototype.randomUsersSuggestion(req, res);
      expect(userService.getRandomUsers).toHaveBeenCalledWith(req.currentUser!.userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user suggestions',
        data: [existingUser]
      });
    });
  });
});
