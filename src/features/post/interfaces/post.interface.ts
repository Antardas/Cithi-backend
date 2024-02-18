import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

// TODO: Move this to the reaction interface later
export interface IReactions {
  like: number;
  love: number;
  happy: number;
  sad: number;
  wow: number;
  angry: number;
}

export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentCount: number;
  imgVersion?: string;
  imgId?: string;
  videoId?: string;
  videoVersion?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createAt?: Date;
}

export interface IGetPostsQuery {
  _id?: string | ObjectId;
  username?: string;
  imgId?: string;
  gifUrl?: string;
  videoId?: string;
}

export interface IPostSaveToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJob {
  key?: ObjectId | string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDelete {
  deletedCount?: number;
}
