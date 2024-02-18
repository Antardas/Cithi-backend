import { UserCache } from '@/service/redis/user.cache';
import { COMMENT_EMAIL, FOLLOWING_EMAIL, emailQueue } from '@/service/queues/email.queue';
import { FollowerModel } from '@/follower/models/follower.model';
import mongoose, { Query, mongo } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IFollowerData, IFollowerDocument } from '@/follower/interfaces/follower.interface';
import { UserModel } from '@/user/models/user.model';
import { IQueryComplete, IQueryDelete } from '@/post/interfaces/post.interface';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { NotFoundError } from '@/global/helpers/error-handler';
import { INotificationDocument, INotificationTemplate } from '@/notification/interfaces/notification.interface';
import { NotificationModel } from '@/notification/models/notification.schema';
import { socketIONotificationObject } from '@/socket/notification';
import { notificationTemplate } from '../emails/notifications/notification-template';

interface FollowerData {
  followerId: string;
  followeeId: string;
  username: string;
  followerDocumentId: ObjectId;
}

const userCache: UserCache = new UserCache();

class FollowerService {
  public async addFollowerToDB(followerData: FollowerData): Promise<void> {
    const { followerId, followeeId, username, followerDocumentId } = followerData;
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    const followerDoc: IFollowerDocument = await FollowerModel.create({
      followeeId: followeeObjectId,
      followerId: followerObjectId,
      _id: followerDocumentId
    });

    const usersPromise: Promise<mongoose.mongo.BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: followerObjectId
          },
          update: {
            $inc: {
              followingCount: 1
            }
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: followeeObjectId
          },
          update: {
            $inc: {
              followersCount: 1
            }
          }
        }
      }
    ]);

    const [users, user]: [mongoose.mongo.BulkWriteResult, IUserDocument | null] = await Promise.all([
      usersPromise,
      userCache.getUserFromCache(followeeId)
    ]);

    if (!user) {
      throw new NotFoundError('Followee not found');
    }

    if (user.notifications.follows) {
      const notificationDoc: INotificationDocument = new NotificationModel();
      const notifications = await notificationDoc.insertNotification({
        userFrom: followerId,
        userTo: followeeId,
        message: `${username}  now following you.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(followerId),
        createdItemId: new mongoose.Types.ObjectId(followerDoc._id),
        createdAt: new Date(),
        comment: '',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: '',
        reaction: ''
      });

      socketIONotificationObject.emit('INSERT_NOTIFICATION', notifications, { userTo: followeeId });
      const templateParams: INotificationTemplate = {
        username: user.username ?? '',
        header: 'Followed you',
        message: `${username}  now following you.`
      };

      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);

      emailQueue.addEmailJob(FOLLOWING_EMAIL, {
        receiverEmail: user.email ?? '',
        subject: 'Follow notification',
        template
      });
    }
  }

  public async removeFollowerToDB(followeeId: string, followerId: string): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDelete, IFollowerDocument> = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });

    const users: Promise<mongoose.mongo.BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: followerObjectId
          },
          update: {
            $inc: {
              followingCount: -1
            }
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: followeeObjectId
          },
          update: {
            $inc: {
              followersCount: -1
            }
          }
        }
      }
    ]);

    await Promise.all([users, unfollow]);
  }

  public async getFollowersData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followee: IFollowerData[] = await FollowerModel.aggregate([
      {
        $match: {
          followeeId: userObjectId
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'followeeId', // LocalField show suggestion all type of object ID
          foreignField: '_id',
          as: 'followeeId' // FIXME : followeeId to followee
        }
      },
      {
        $unwind: '$followeeId'
      },
      {
        $lookup: {
          from: 'Auth',
          localField: 'followeeId.authId',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followeeId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          followersCount: '$followeeId.followersCount',
          followingCount: '$followeeId.followingCount',
          profilePicture: '$followeeId.profilePicture',
          postCount: '$followeeId.postCount',
          uId: '$followeeId.uId',
          userProfile: '$followeeId'
        }
      },
      {
        $project: {
          authId: 0,
          followeeId: 0,
          followerId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followee;
  }

  public async getFolloweesData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followers: IFollowerData[] = await FollowerModel.aggregate([
      {
        $match: {
          followerId: userObjectId
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'followerId', // LocalField show suggestion all type of object ID
          foreignField: '_id',
          as: 'followerId' // FIXME : followerId to followee
        }
      },
      {
        $unwind: '$followerId'
      },
      {
        $lookup: {
          from: 'Auth',
          localField: 'followerId.authId',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followerId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          followersCount: '$followerId.followersCount',
          followingCount: '$followerId.followingCount',
          profilePicture: '$followerId.profilePicture',
          postCount: '$followerId.postCount',
          uId: '$followerId.uId',
          userProfile: '$followerId'
        }
      },
      {
        $project: {
          authId: 0,
          followeeId: 0,
          followerId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followers;
  }

  public async getFollowingUsersIds(user: string): Promise<string[]> {
    const followee = await FollowerModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user)
        }
      },
      {
        $project: {
          followeeId: 1,
          _id: 1
        }
      }
    ]);

    return followee.map((item) => item.followeeId.toString());
  }
}
export const followerService: FollowerService = new FollowerService();
