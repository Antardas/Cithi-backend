import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@/service/redis/follower.cache';
import { UserCache } from '@/service/redis/user.cache';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Add {
  public async follower(req:Request, res: Response):Promise<void> {
    const { followerId } = req.params;
    const followerCount:Promise<void>  = followerCache.updateFollowerCountInCache(req.currentUser?.userId, )
  }
}
