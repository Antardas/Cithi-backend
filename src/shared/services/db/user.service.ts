import { AuthModel } from '@/auth/models/auth.model';
import { NotFoundError } from '@/global/helpers/error-handler';
import { followerService } from '@/service/db/follower.service';
import { IBasicInfo, INotificationSettings, ISearchUser, ISocialLinks, IUserDocument } from '@/user/interfaces/user.interface';
import { UserModel } from '@/user/models/user.model';
import { indexOf } from 'lodash';
import mongoose, { UpdateQuery } from 'mongoose';

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const user: IUserDocument | null = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User Not Found');
    }

    await AuthModel.findByIdAndUpdate(user.authId, {
      $set: {
        password: newPasswordHash
      }
    });
  }

  public async updateBasicInfo(userId: string, data: IBasicInfo): Promise<void> {
    const { quote, location, school, work } = data;
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        quote,
        location,
        school,
        work
      }
    });
  }

  public async updateSocialLink(userId: string, data: ISocialLinks): Promise<void> {
    const { facebook, instagram, twitter, youtube } = data;
    // TODO: here handle the Set in Object if any property is undefined then it will keep as it as same in DB
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        'social.facebook': facebook,
        'social.instagram': instagram,
        'social.twitter': twitter,
        'social.youtube': youtube
      }
    });
  }
  public async updateNotificationSettings(userId: string, data: INotificationSettings): Promise<void> {
    const { comments, follows, messages, reactions } = data;
    // TODO: here handle the Set in Object if any property is undefined then it will keep as it as same in DB
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        'notifications.comments': comments,
        'notifications.follows': follows,
        'notifications.messages': messages,
        'notifications.reactions': reactions
      }
    });
  }

  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: {
          authId: new mongoose.Types.ObjectId(authId)
        }
      },
      {
        $lookup: {
          localField: 'authId',
          from: 'Auth',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProjects()
      }
    ]);
    return users[0];
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          localField: 'authId',
          from: 'Auth',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProjects()
      }
    ]);
    return users[0];
  }

  public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: {
          _id: {
            $ne: new mongoose.Types.ObjectId(userId)
          }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          localField: 'authId',
          from: 'Auth',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProjects()
      }
    ]);
    return users;
  }

  public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      {
        $match: {
          _id: {
            $ne: new mongoose.Types.ObjectId(userId)
          }
        }
      },
      {
        $lookup: {
          localField: 'authId',
          from: 'Auth',
          foreignField: '_id',
          as: 'authId'
        }
      },
      { $unwind: '$authId' },
      {
        $sample: {
          size: 10
        }
      },
      {
        $addFields: {
          username: '$authId.username',
          email: '$authId.email',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          createdAt: '$authId.createdAt'
        }
      },
      {
        $project: {
          authId: 0,
          __v: 0
        }
      }
    ]);

    const followers: string[] = await followerService.getFollowingUsersIds(userId);

    const randomUser: IUserDocument[] = [];
    for (const user of users) {
      const followerIndex: number = indexOf(followers, user._id.toString());
      if (followerIndex < 0) {
        randomUser.push(user);
      }
    }
    return randomUser;
  }

  public async searchUsers(regex: RegExp): Promise<ISearchUser[]> {
    const users = await AuthModel.aggregate([
      {
        $match: {
          username: regex
        }
      },
      {
        $lookup: {
          localField: '_id',
          from: 'User',
          foreignField: 'authId',
          as: 'User'
        }
      },
      {
        $unwind: '$User'
      },
      {
        $project: {
          _id: '$User._id',
          profilePicture: '$User.profilePicture',
          username: 1,
          avatarColor: 1,
          email: 1
        }
      }
    ]);
    return users;
  }

  public async incrementPostCount(userId: string) {
    const user: UpdateQuery<IUserDocument> = await UserModel.updateOne(
      { _id: userId },
      {
        $inc: { postsCount: 1 }
      }
    );
    return user;
  }

  public async getTotalUserFromDB(): Promise<number> {
    const totalCount: number = await UserModel.countDocuments({});
    return totalCount;
  }
  private aggregateProjects() {
    return {
      _id: 1,
      username: '$authId.username',
      email: '$authId.email',
      uId: '$authId.uId',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}

export const userService: UserService = new UserService();
