import { IUserDocument } from '@/user/interfaces/user.interface';
import { UserModel } from '@/user/models/user.model';
import mongoose, { UpdateQuery } from 'mongoose';

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
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

  public async incrementPostCount(userId: string) {
    const user: UpdateQuery<IUserDocument> = await UserModel.updateOne(
      { _id: userId },
      {
        $inc: { postsCount: 1 }
      }
    );
    return user;
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
