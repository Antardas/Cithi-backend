import { authMock } from '@/root/mocks/auth.mock';
import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { IFileImageDocument } from '@/image/interfaces/image.interface';
import { Response } from 'express';
import mongoose from 'mongoose';

export const imageMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({ body, currentUser, params });

export const imageMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IBody {
  image?: string;
}
interface IParams {
  userId?: string;
  imageId?: string;
}

export const fileDocumentMock: IFileImageDocument = {
  userId: new mongoose.Types.ObjectId(authMock._id),
  bgImageVersion: '1706539580',
  bgImageId: 'dlopduezgdktq6wvfbxh',
  imgId: 'dlopduezgdktq6wvfbxh',
  imgVersion: '1706539580',
  createdAt: new Date(),
  _id: '60263f14728fed9846e322f9'
} as IFileImageDocument;
