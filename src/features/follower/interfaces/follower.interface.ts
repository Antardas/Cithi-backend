import { IUserDocument } from '@/user/interfaces/user.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  followeeId?: IFollowerData;
  followerId?: IFollowerData;
  createdAt?: Date;
}

export interface IFollowerData {
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postCount: number;
  username: string;
  uId: string;
  _id?: mongoose.Types.ObjectId;
  userProfile?: IUserDocument;
}

export interface IFollowerJobData {
  followeeId?: string;
  followerId?: string;
  username?: string;
  followerDocumentId?: ObjectId;
}

export interface IBlockedUserJobData {
  blockingUserId?: string;
  blockedUserId?: string;
  type?: 'block' | 'unblock';
}
