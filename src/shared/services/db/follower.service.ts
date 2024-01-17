import { FollowerModel } from '@/follower/models/follower.model';
import mongoose, { Query } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IFollowerDocument } from '@/follower/interfaces/follower.interface';
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
    const {followerId, followeeId, username, followerDocumentId } = followerData;
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId( followeeId);
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
            _id:  followerObjectId
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
}
export const followerService: FollowerService = new FollowerService();
