import { Remove } from '@/follower/controllers/unfollow-user';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { followMockRequest, followMockResponse, followeeId } from '@/root/mocks/follow.mock';
import { REMOVE_FOLLOWER_FROM_DB, followerQueue } from '@/service/queues/follower.queue';
import { FollowerCache } from '@/service/redis/follower.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@/service/redis/follower.cache');
jest.mock('@/service/queues/follower.queue');

describe('Remove', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should send the correct JSON response', async () => {
    const req: Request = followMockRequest({}, authUserPayload, {
      followeeId: followeeId
    }) as Request;
    const res: Response = followMockResponse();

    jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');
    jest.spyOn(FollowerCache.prototype, 'removeFollowerFromCache');
    jest.spyOn(followerQueue, 'addFollowerJob');

    await Remove.prototype.follower(req, res);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(followeeId, 'followersCount', -1);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'followingCount', -1);

    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(`followers:${followeeId}`, req.currentUser?.userId);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(`following:${req.currentUser?.userId}`, followeeId);
    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith(REMOVE_FOLLOWER_FROM_DB, {
      followeeId,
      followerId: req.currentUser?.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollow user now'
    });
  });
});
