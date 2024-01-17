import { existingUser } from '@/root/mocks/user.mock';
import { IFollowerData } from '@/follower/interfaces/follower.interface';
import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { Response } from 'express';
import mongoose from 'mongoose';

export const followMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({ body, currentUser, params });

export const followMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IBody {}
interface IParams {
  followeeId?: string;
}

export const mockFollowerData: IFollowerData = {
  avatarColor: `${existingUser.avatarColor}`,
  followersCount: existingUser.followersCount,
  followingCount: existingUser.followingCount,
  postCount: existingUser.postsCount,
  profilePicture: `${existingUser.profilePicture}`,
  username: `${existingUser.username}`,
  uId: `${existingUser.uId}`,
  _id: new mongoose.Types.ObjectId(existingUser._id)
};

export const followerData = {
  _id: '605727cd646cb50e668a4e13',
  followerId: {
    username: 'Antar_1',
    postCount: 5,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13'
  },
  followeeId: {
    username: 'Antar',
    postCount: 10,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13'
  }
};

export const followeeId: string = '6064861bc25eaa5a5d2f9bf4';
