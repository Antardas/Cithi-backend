import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
type ID = string | ObjectId;
export interface IReactionDocument extends Document {
  _id?: ID;
  username: string;
  avatarColor: string;
  type: string;
  postId: string;
  profilePicture: string;
  createdAt: string;
  userTo: ID;
  comment: string;
}

export interface IReactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
  userTo?: string;
  userFrom?: string;
  type?: string;
  reactionObject?: IReactionDocument;
}

export interface IQueryReaction {
  _id?: ID;
  postId?: ID;
}

export interface IReaction {
  senderName: string;
  type: string;
}
