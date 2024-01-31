import { Get } from '@/image/controllers/get-image';
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
import { imageService } from '@/service/db/image.service';

jest.useFakeTimers();

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('image', () => {
    it('should send correct json response for background image upload ', async () => {
      const req: Request = imageMockRequest({}, authUserPayload, {
        userId: existingUser._id as string
      }) as Request;
      const res: Response = imageMockResponse();
      jest.spyOn(imageService, 'getImages').mockResolvedValue([fileDocumentMock]);
      await Get.prototype.images(req, res);
      expect(imageService.getImages).toHaveBeenCalledWith(req.params.userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Images',
        data: [fileDocumentMock]
      });
    });
  });
});
