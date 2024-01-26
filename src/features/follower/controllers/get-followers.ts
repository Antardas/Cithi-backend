import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { IFollower, IFollowerData } from '@/follower/interfaces/follower.interface';
import { FollowerCache } from '@/service/redis/follower.cache';
import { followerService } from '@/service/db/follower.service';
const followerCache: FollowerCache = new FollowerCache();
export class Get {
  public async followings(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);

    const cachedFollowings: IFollowerData[] = await followerCache.getFollowerFromCache(`following:${req.currentUser?.userId}`);

    const followings: IFollowerData[] = cachedFollowings.length ? cachedFollowings : await followerService.getFolloweesData(userObjectId);

    res.status(HTTP_STATUS.OK).json({
      data: followings,
      message: 'All Followings user'
    });
  }

  public async followers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);

    const cachedFollowers: IFollowerData[] = await followerCache.getFollowerFromCache(`followers:${req.currentUser?.userId}`);

    const followers: IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFollowersData(userObjectId);

    res.status(HTTP_STATUS.OK).json({
      data: followers,
      message: 'All Followers user'
    });
  }
}
