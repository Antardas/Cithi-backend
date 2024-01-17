import { IFollowerData } from '@/follower/interfaces/follower.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@/service/redis/follower.cache';
import { UserCache } from '@/service/redis/user.cache';
import { IUserDocument } from '@/user/interfaces/user.interface';
import mongoose from 'mongoose';
import { socketIOFollowerObject } from '@/socket/follower';
import { ADD_FOLLOWER_TO_DB, followerQueue } from '@/service/queues/follower.queue';
const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    // updating the Number is Cache
    const followerCount: Promise<void> = followerCache.updateFollowerCountInCache(followeeId, 'followersCount', 1);
    const followingCount: Promise<void> = followerCache.updateFollowerCountInCache(`${req.currentUser?.userId}`, 'followingCount', 1);
    await Promise.all([followingCount, followerCount]);

    const cachedFollowing: Promise<IUserDocument> = userCache.getUserFromCache(followeeId) as Promise<IUserDocument>;
    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser?.userId}`) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowing]);

    const followerObjectId: ObjectId = new ObjectId();
    const addFolloweeData: IFollowerData = Add.prototype.userData(response[0]);

    socketIOFollowerObject.emit('ADD_FOLLOWER', addFolloweeData);

    const saveFollowingToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser?.userId}`,`${followeeId}`);
    const saveFollowToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followeeId}`, `${req.currentUser?.userId}`);

    await Promise.all([saveFollowToCache, saveFollowingToCache]);

    followerQueue.addFollowerJob(ADD_FOLLOWER_TO_DB, {
      followeeId: followeeId,
      followerDocumentId: followerObjectId,
      followerId: `${req.currentUser?.userId}`,
      username: req.currentUser?.username
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
