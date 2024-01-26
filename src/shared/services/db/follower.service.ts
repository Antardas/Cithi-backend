import { FollowerModel } from '@/follower/models/follower.model';
import mongoose, { Query } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IFollowerData, IFollowerDocument } from '@/follower/interfaces/follower.interface';
import { UserModel } from '@/user/models/user.model';
import { IQueryComplete, IQueryDelete } from '@/post/interfaces/post.interface';

interface FollowerData {
  followerId: string;
  followeeId: string;
  username: string;
  followerDocumentId: ObjectId;
}

class FollowerService {
  public async addFollowerToDB(followerData: FollowerData): Promise<void> {
    const { followerId, followeeId, username, followerDocumentId } = followerData;
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    await FollowerModel.create({
      followeeId: followeeObjectId,
      followerId: followerObjectId,
      _id: followerDocumentId
    });

    const users: Promise<mongoose.mongo.BulkWriteResult> = UserModel.bulkWrite([
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

    await Promise.all([users, UserModel.findById(followeeId)]);
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
}
export const followerService: FollowerService = new FollowerService();
