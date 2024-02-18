import { Add } from '@/follower/controllers/follower-user';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { followMockRequest, followMockResponse, followeeId } from '@/root/mocks/follow.mock';
import { existingUser } from '@/root/mocks/user.mock';
import { FollowerCache } from '@/service/redis/follower.cache';
import { UserCache } from '@/service/redis/user.cache';
import { Request, Response } from 'express';
import * as followerServer from '@/socket/follower';
import { Server } from 'socket.io';
import { ADD_FOLLOWER_TO_DB, followerQueue } from '@/service/queues/follower.queue';

jest.useFakeTimers();
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/redis/follower.cache');
// socketIOFollowerObject2 = new Server();
Object.defineProperties(followerServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true
  }
});
describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('follower', () => {
    it('Should call the updateFollowersInCache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        followeeId: followeeId
      }) as Request;

      const res: Response = followMockResponse();

      jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follower(req, res);
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(followeeId, 'followersCount', 1);
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(req.currentUser?.userId, 'followingCount', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('Should call the saveFollowerToCache', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        followeeId: followeeId
      }) as Request;

      const res: Response = followMockResponse();

      jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follower(req, res);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledTimes(2);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`, `${followeeId}`);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(`followers:${followeeId}`, `${req.currentUser?.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('Should call the followerQueue addFollowerJob', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        followeeId: followeeId
      }) as Request;

      const res: Response = followMockResponse();

      const spy = jest.spyOn(followerQueue, 'addFollowerJob');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
      await Add.prototype.follower(req, res);
      expect(followerQueue.addFollowerJob).toHaveBeenCalledWith(ADD_FOLLOWER_TO_DB, {
        followeeId,
        followerId: req.currentUser?.userId,
        username: req.currentUser?.username,
        followerDocumentId: spy.mock.calls[0][1].followerDocumentId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });
  });
});
