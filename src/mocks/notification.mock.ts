import { existingUser } from '@/root/mocks/user.mock';
import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { Response } from 'express';
import mongoose from 'mongoose';
import { INotificationDocument } from '@/notification/interfaces/notification.interface';

export const notificationMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({ body, currentUser, params });

export const notificationMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IBody {}

interface IParams {
  id?: string;
}

export const notificationData = {
  _id: '65b5f0815a95516a23088686',
  userTo: '60263f14648fed5246e322d3',
  userFrom: {
    profilePicture: 'https://res.cloudinary.com/dyn3w0n6w/image/upload/v1705471757/65a76f00e3260b4f2d15ed27',
    username: 'Devant',
    avatarColor: 'black',
    uId: '226751486246'
  },
  read: false,
  message: 'Devant  now following you.',
  notificationType: 'comment',
  entityId: '65a76f00e3260b4f2d15ed27',
  createdItemId: '65b5f0805a95516a23088680',
  comment: '',
  reaction: '',
  post: '',
  imgId: '',
  gifUrl: '',
  createdAt: '2024-01-28T06:13:21.038Z'
} as unknown as INotificationDocument;
