import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

// TODO: Move this to the reaction interface later
interface IReaction {
  like: number;
  love: number;
  haha: number;
  sad: number;
  wow: number;
  angry: number;
}

export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  username: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentCount: number;
  imgVersion?: string;
  imgId?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReaction;
  createAt?: Date;
}

export interface IGetPostsQuery {
  _id?: string | ObjectId;
  username: string;
  imgId?: string;
  gifUrl?: string;
}

export interface IPostSaveToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createPost: IPostDocument;
}

export interface IPostJobData {
  key?: ObjectId | string;
  value?: IPostDocument;
  keyOne: string,
  keyTwo: string,
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDelete {
  deletedCount?: number;
}
