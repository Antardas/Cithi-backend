import { AddUser } from '@/follower/controllers/block-user';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { followMockRequest, followMockResponse, followeeId } from '@/root/mocks/follow.mock';
import { ADD_BLOCK_USER_TO_DB, REMOVE_BLOCK_USER_FROM_DB, blockQueue } from '@/service/queues/blocked.queue';
import { FollowerCache } from '@/service/redis/follower.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@/service/redis/follower.cache');
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/db/follower.service');

describe('AddUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('block', () => {
    it('should return the correct json response', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(blockQueue, 'addBlockUserJob');

      await AddUser.prototype.block(req, res);
      expect(FollowerCache.prototype.updateBlockedPropInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, req.params.id, 'blocked', 'block');
      expect(FollowerCache.prototype.updateBlockedPropInCache).toHaveBeenCalledWith(
        req.params.id,
        `${req.currentUser?.userId}`,
        'blockedBy',
        'block'
      );
      expect(blockQueue.addBlockUserJob).toHaveBeenCalledWith(ADD_BLOCK_USER_TO_DB, {
        blockingUserId: `${req.currentUser?.userId}`,
        blockedUserId: req.params.id,
        type: 'block'
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User Block successfully'
      });
    });
  });

  describe('unblock', () => {
    it('should return the correct json response', async () => {
      const req: Request = followMockRequest({}, authUserPayload, {
        id: followeeId
      }) as Request;

      const res: Response = followMockResponse();
      jest.spyOn(blockQueue, 'addBlockUserJob');

      await AddUser.prototype.unblock(req, res);
      expect(FollowerCache.prototype.updateBlockedPropInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, req.params.id, 'blocked', 'unblock');
      expect(FollowerCache.prototype.updateBlockedPropInCache).toHaveBeenCalledWith(
        req.params.id,
        `${req.currentUser?.userId}`,
        'blockedBy',
        'unblock'
      );
      expect(blockQueue.addBlockUserJob).toHaveBeenCalledWith(REMOVE_BLOCK_USER_FROM_DB, {
        blockingUserId: `${req.currentUser?.userId}`,
        blockedUserId: req.params.id,
        type: 'unblock'
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User unblock successfully'
      });
    });
  });
});
