import { authUserPayload } from '@/root/mocks/auth.mock';
import { followMockRequest, followMockResponse, followeeId, mockFollowerData } from '@/root/mocks/follow.mock';
import { Request, Response } from 'express';
import { Get } from '@/follower/controllers/get-followers';
import { FollowerCache } from '@/service/redis/follower.cache';
import { followerService } from '@/service/db/follower.service';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('@/service/redis/follower.cache');
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/db/follower.service');
describe('Get', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('followings', () => {
    it('should send correct json response if user following exist in cache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([mockFollowerData]);
      await Get.prototype.followings(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followings user',
        data: [mockFollowerData]
      });
    });

    it('should send correct json response if user following exist in database', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFolloweesData').mockResolvedValue([mockFollowerData]);
      await Get.prototype.followings(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`);
      expect(followerService.getFolloweesData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser?.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followings user',
        data: [mockFollowerData]
      });
    });

    it('should send correct json response if user following does not exist', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFolloweesData').mockResolvedValue([]);

      await Get.prototype.followings(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`);
      expect(followerService.getFolloweesData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser?.userId));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followings user',
        data: []
      });
    });
  });

  // Followers unit testing
  describe('followers', () => {
    it('should send correct json response if user followers exist in cache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([mockFollowerData]);
      await Get.prototype.followers(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`followers:${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followers user',
        data: [mockFollowerData]
      });
    });

    it('should send correct json response if user followers exist in database', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        followeeId: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowersData').mockResolvedValue([mockFollowerData]);
      await Get.prototype.followers(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`followers:${req.currentUser?.userId}`);
      expect(followerService.getFollowersData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser?.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followers user',
        data: [mockFollowerData]
      });
    });

    it('should send correct json response if user following does not exist', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        followeeId: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowerFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowersData').mockResolvedValue([]);
      await Get.prototype.followers(req, res);
      expect(FollowerCache.prototype.getFollowerFromCache).toHaveBeenCalledWith(`followers:${req.currentUser?.userId}`);
      expect(followerService.getFollowersData).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser?.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Followers user',
        data: []
      });
    });
  });
});
