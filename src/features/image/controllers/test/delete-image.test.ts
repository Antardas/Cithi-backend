import { Delete } from '@/image/controllers/delete-image';
import { Request, Response } from 'express';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { fileDocumentMock, imageMockRequest, imageMockResponse } from '@/root/mocks/image.mock';
import * as cloudinaryUpload from '@/global/helpers/cloudinary-upload';
import * as imageServer from '@/socket/image';
import { Server } from 'socket.io';
import { config } from '@/root/config';
import { UserCache } from '@/service/redis/user.cache';
import { existingUser } from '@/root/mocks/user.mock';
import { ADD_USER_PROFILE_IMAGE_TO_DB, REMOVE_IMAGE_FROM_DB, UPDATE_BACKGROUND_IMAGE_IN_BD, imageQueue } from '@/service/queues/image.queue';
import { imageService } from '@/service/db/image.service';
const image: string =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAB0CAIAAACNAq5DAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABJklEQVR4nO3RAQkAIQDAwPeTKNg/oylEGHcJBhtz7Y+u/3UAdxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3CcwXEGxxkcZ3DcAaPRAU0/5RYtAAAAAElFTkSuQmCC';

jest.useFakeTimers();
jest.mock('@/global/helpers/cloudinary-upload');
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/queues/image.queue');
jest.mock('@/service/db/image.service');
Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
});
describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('image', () => {
    it('should send correct json response for background image upload ', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {
        imageId: fileDocumentMock.imgId
      }) as Request;
      const res: Response = imageMockResponse();

      jest.spyOn(imageQueue, 'addImageJob');
      const backgroundImageSpy = jest.spyOn(imageServer.socketIOImageObject, 'emit');

      await Delete.prototype.image(req, res);
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('DELETE_IMAGE', backgroundImageSpy.mock.calls[0][1]);
      expect(imageQueue.addImageJob).toHaveBeenCalledWith(REMOVE_IMAGE_FROM_DB, {
        imgId: req.params.imageId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image Deleted successfully'
      });
    });
  });
  describe('backgroundImage', () => {
    it('should send correct json response for background image upload ', async () => {
      const req: Request = imageMockRequest({ image }, authUserPayload, {
        imageId: fileDocumentMock.imgId
      }) as Request;
      const res: Response = imageMockResponse();

      jest.spyOn(imageService, 'getImageByBackgroundId').mockResolvedValue(fileDocumentMock);
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');
      jest.spyOn(imageQueue, 'addImageJob');
      const backgroundImageSpy = jest.spyOn(imageServer.socketIOImageObject, 'emit');

      await Delete.prototype.backgroundImage(req, res);
      expect(imageService.getImageByBackgroundId).toHaveBeenCalledWith(req.params.imageId);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledTimes(2);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageId', '');
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageVersion', '');
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('DELETE_IMAGE', backgroundImageSpy.mock.calls[0][1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image Deleted successfully'
      });
    });
  });
});
