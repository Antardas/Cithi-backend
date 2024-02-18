import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { IAuthMock, IJWT } from '@/root/mocks/auth.mock';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { Response } from 'express';

export interface IQuery {
  page?: string;
}
export const userMockRequest = (cookieData: IJWT, body: IAuthMock, currentUser: AuthPayload | null, params: unknown, query: IQuery | unknown) => ({
  cookies: cookieData,
  body,
  params,
  currentUser,
  query
});

export const userMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const mockExistingUser = {
  notifications: {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '60263f14648fed5246e322d9',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUser = {
  notifications: {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Devant',
  email: 'dev.antardas@gmail.com',
  avatarColor: 'red',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUserTwo = {
  notifications: {
    messages: false,
    reactions: true,
    comments: true,
    follows: false
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '60263f14648fed5246e322d8',
  uId: '1621613119252065',
  username: 'Devant',
  email: 'dev.antardas@gmail.com',
  avatarColor: '#9c27b1',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const mergedAuthAndUserData = {
  notifications: {
    messages: false,
    reactions: true,
    comments: true,
    follows: false
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '60263f14648fed5246e322d8',
  authId: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Devant',
  email: 'dev.antardas@gmail.com',
  avatarColor: '#9c27b0',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: '2022-08-31T07:42:24.451Z'
} as unknown as IUserDocument;

export const searchedUserMock = {
  profilePicture: 'http://place-hold.it/500x500',
  _id: '60263f14648fed5246e322d5',
  uId: '1621613119252062',
  username: 'Devant',
  email: 'dev.antardas@gmail.com',
  avatarColor: '#9c27b1'
};

export const userJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
