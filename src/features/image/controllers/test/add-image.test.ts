import { Request, Response } from 'express';
import { Add } from '@/image/controllers/add-image';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { fileDocumentMock, imageMockRequest, imageMockResponse } from '@/root/mocks/image.mock';
import * as cloudinaryUpload from '@/global/helpers/cloudinary-upload';
import * as imageServer from '@/socket/image';
import { Server } from 'socket.io';
import { config } from '@/root/config';
import { UserCache } from '@/service/redis/user.cache';
import { existingUser } from '@/root/mocks/user.mock';
import { ADD_USER_PROFILE_IMAGE_TO_DB, UPDATE_BACKGROUND_IMAGE_IN_BD, imageQueue } from '@/service/queues/image.queue';
const image: string =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAB0CAIAAACNAq5DAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABJklEQVR4nO3RAQkAIQDAwPeTKNg/oylEGHcJBhtz7Y+u/3UAdxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3DcAaPRAU0/5RYtAAAAAElFTkSuQmCC';

jest.useFakeTimers();
jest.mock('@/global/helpers/cloudinary-upload');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/queues/image.queue');
Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
});
describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  describe('profileImage', () => {
    it('should call profileImage method', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {}) as Request;
      const res: Response = imageMockResponse();
      jest.spyOn(cloudinaryUpload, 'uploads').mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (): any => Promise.resolve({ version: fileDocumentMock.imgVersion, public_id: fileDocumentMock.imgId })
      );
      const url: string = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${fileDocumentMock.imgVersion}/${fileDocumentMock.imgId}`;

      await Add.prototype.profileImage(req, res);
      expect(cloudinaryUpload.uploads).toHaveBeenCalledWith(req.body.image, req.currentUser?.userId, true, true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the user profile',
        data: url
      });
    });
    it('should call updateSingleUserItemInCache method', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {}) as Request;
      const res: Response = imageMockResponse();
      jest.spyOn(cloudinaryUpload, 'uploads').mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (): any => Promise.resolve({ version: fileDocumentMock.imgVersion, public_id: fileDocumentMock.imgId })
      );
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(existingUser);
      jest.spyOn(imageServer.socketIOImageObject, 'emit');
      const url: string = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${fileDocumentMock.imgVersion}/${fileDocumentMock.imgId}`;

      await Add.prototype.profileImage(req, res);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'profilePicture', url);
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('UPDATE_PROFILE_IMAGE', existingUser);
      expect(imageQueue.addImageJob).toHaveBeenCalledWith(ADD_USER_PROFILE_IMAGE_TO_DB, {
        key: req.currentUser?.userId,
        value: url,
        imgId: fileDocumentMock.imgId,
        imgVersion: fileDocumentMock.imgVersion
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the user profile',
        data: url
      });
    });
  });

  describe('backgroundImage', () => {
    it('should call uploads method', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {}) as Request;
      const res: Response = imageMockResponse();
      jest.spyOn(cloudinaryUpload, 'uploads').mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (): any => Promise.resolve({ version: fileDocumentMock.imgVersion, public_id: fileDocumentMock.imgId })
      );
      const url: string = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${fileDocumentMock.imgVersion}/${fileDocumentMock.imgId}`;

      await Add.prototype.backgroundImage(req, res);
      expect(cloudinaryUpload.uploads).toHaveBeenCalledWith(req.body.image);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the user profile'
      });
    });

    it('should call updateSingleUserItemInCache method', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {}) as Request;
      const res: Response = imageMockResponse();
      jest.spyOn(cloudinaryUpload, 'uploads').mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (): any => Promise.resolve({ version: fileDocumentMock.imgVersion, public_id: fileDocumentMock.imgId })
      );
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(existingUser);
      const url: string = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${fileDocumentMock.imgVersion}/${fileDocumentMock.imgId}`;
      jest.spyOn(imageServer.socketIOImageObject, 'emit');
      await Add.prototype.backgroundImage(req, res);
      expect(cloudinaryUpload.uploads).toHaveBeenCalledWith(req.body.image);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledTimes(2);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageId', fileDocumentMock.imgId);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'bgImageVersion',
        fileDocumentMock.imgVersion
      );
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('UPDATE_BACKGROUND_IMAGE', {
        bgImageId: fileDocumentMock.imgId,
        bgImageVersion: fileDocumentMock.bgImageVersion,
        userId: req.currentUser?.userId
      });
      expect(imageQueue.addImageJob).toHaveBeenCalledWith(UPDATE_BACKGROUND_IMAGE_IN_BD, {
        key: req.currentUser?.userId,
        imgId: fileDocumentMock.imgId,
        imgVersion: fileDocumentMock.imgVersion
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update the user profile',
      });
    });


  });
});
