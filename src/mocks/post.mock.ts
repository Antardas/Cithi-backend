import { existingUser } from '@/root/mocks/user.mock';
import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { Response } from 'express';
import mongoose from 'mongoose';

export const postMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({ body, currentUser, params });

export const postMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IParams {
  postId?: string;
  page?: string;
}

interface IBody {
  bgColor: string;
  post?: string;
  gifUrl?: string;
  image?: string;
  imgId?: string;
  imgVersion?: string;
  profilePicture?: string;
  feelings?: string;
}

export const newPost: IBody = {
  bgColor: '#F0F0F0',
  post: 'This is a sample post text.',
  gifUrl: 'https://example.com/sample.gif',
  image:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAAFcBAMAAAB2OBsfAAAAJ1BMVEX/wgBmcHmKW0Lu7u//6b/////63aTexJJDSVWelorBkyj91FW9vrpE8aa/AAATfUlEQVR42sydv2/',
  imgId: '',
  imgVersion: '',
  profilePicture: 'https://example.com/profile.jpg',
  feelings: 'Happy'
};

export const postMockData: IPostDocument = {
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  userId: existingUser._id,
  username: existingUser.username,
  email: existingUser.email,
  avatarColor: existingUser.avatarColor,
  profilePicture: existingUser.profilePicture,
  post: 'This is a mock post content.',
  bgColor: '#F0F0F0',
  feelings: 'Happy',
  privacy: 'public',
  gifUrl: 'https://example.com/mock.gif',
  commentCount: 0,
  imgVersion: 'v1',
  imgId: 'mockImageId789',
  createdAt: new Date(),
  reactions: {
    angry: 0,
    like: 0,
    love: 0,
    happy: 0,
    sad: 0,
    wow: 0
  }
} as unknown as IPostDocument;

export const updatedPost = {
  profilePicture: postMockData.profilePicture,
  post: postMockData.post,
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  privacy: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: ''
};

export const updatedPostWithImage = {
  profilePicture: postMockData.profilePicture,
  post: 'Wonderful',
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  privacy: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: ''
};
