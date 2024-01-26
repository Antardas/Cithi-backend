import HTTP_STATUS from 'http-status-codes';
import { ADD_BLOCK_USER_TO_DB, REMOVE_BLOCK_USER_FROM_DB, blockQueue } from '@/service/queues/blocked.queue';
import { FollowerCache } from '@/service/redis/follower.cache';
import { Request, Response } from 'express';
const followerCache: FollowerCache = new FollowerCache();
export class AddUser {
  public async block(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await AddUser.prototype.updateBlockedUser(`${req.currentUser?.userId}`, id, 'block');

    blockQueue.addBlockUserJob(ADD_BLOCK_USER_TO_DB, {
      blockingUserId: `${req.currentUser?.userId}`,
      blockedUserId: id,
      type: 'block'
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'User Block successfully'
    });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await AddUser.prototype.updateBlockedUser(`${req.currentUser?.userId}`, id, 'unblock');

    blockQueue.addBlockUserJob(REMOVE_BLOCK_USER_FROM_DB, {
      blockingUserId: `${req.currentUser?.userId}`,
      blockedUserId: id,
      type: 'unblock'
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'User unblock successfully'
    });
  }

  private async updateBlockedUser(blockingUserId: string, blockedUserId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedPropInCache(blockingUserId, blockedUserId, 'blocked', type);
    const blockedBy: Promise<void> = followerCache.updateBlockedPropInCache(blockedUserId, blockingUserId, 'blockedBy', type);

    Promise.all([blocked, blockedBy]);
  }
}
