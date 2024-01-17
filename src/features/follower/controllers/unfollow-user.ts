import { IFollowerData } from '@/follower/interfaces/follower.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@/service/redis/follower.cache';
import { UserCache } from '@/service/redis/user.cache';
import { IUserDocument } from '@/user/interfaces/user.interface';
import mongoose from 'mongoose';
import { socketIOFollowerObject } from '@/socket/follower';
import { ADD_FOLLOWER_TO_DB, REMOVE_FOLLOWER_FROM_DB, followerQueue } from '@/service/queues/follower.queue';
const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;
    const followerId: string = `${req.currentUser?.userId}`;
    // updating the Number is Cache
    const followerCount: Promise<void> = followerCache.updateFollowerCountInCache(followeeId, 'followersCount', -1);
    const followingCount: Promise<void> = followerCache.updateFollowerCountInCache(`${followerId}`, 'followingCount', -1);

    const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);
    const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowerFromCache(`following:${followerId}`, followeeId);
    await Promise.all([removeFolloweeFromCache, removeFollowerFromCache, followerCount, followingCount]);

    // socketIOFollowerObject.emit('ADD_FOLLOWER', addFolloweeData);

    followerQueue.addFollowerJob(REMOVE_FOLLOWER_FROM_DB, {
      followeeId,
      followerId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Unfollow user now' });
  }
}
