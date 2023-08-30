import * as cloudinaryUploads from '@/global/helpers/cloudinary-upload';
import { CustomError } from '@/global/helpers/error-handler';
import { Create } from '@/post/controllers/create-post';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { newPost, postMockRequest, postMockResponse } from '@/root/mocks/post.mock';
import { ADD_POST_TO_DB, postQueue } from '@/service/queues/post.queue';
import { PostCache } from '@/service/redis/post.cache';
import * as postServer from '@/socket/post';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { Server } from 'socket.io';
jest.useFakeTimers();
jest.mock('@/service/redis/base.cache');
jest.mock('@/service/redis/post.cache');
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/queues/post.queue');
jest.mock('@/global/helpers/cloudinary-upload');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Create', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('post', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse() as Response;
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
      jest.spyOn(postQueue, 'addPostJob');

      await Create.prototype.post(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('addPost', createdPost);
      expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        createdPost: createdPost,
        currentUserId: `${req.currentUser!.userId}`,
        uId: `${req.currentUser!.uId}`
      });

      expect(postQueue.addPostJob).toHaveBeenCalledWith(ADD_POST_TO_DB, {
        key: req.currentUser?.userId,
        value: createdPost
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post Create Successfully'
      });
    });
  });
  describe('postWithImage', () => {
    it('should throw if image is not available', () => {
      delete newPost.image;
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse() as Response;

      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('image is a required field');
      });
    });

    it('should throw a upload error', () => {
      newPost.image = 'data:text/plain;base64,MpzrUYccN2p2TcAdYIYOfG061dKu5LPC0sLaTtO';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse() as Response;

      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation(
          (): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> =>
            Promise.resolve({ version: '', public_id: '', message: 'upload error' }) as unknown as Promise<
              UploadApiErrorResponse | UploadApiResponse | undefined
            >
        );
      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeError().message).toEqual('upload error');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse() as Response;
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation(
          (): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> =>
            Promise.resolve({ version: 1236444, public_id: 'd6d2d98d25d45d9d' }) as unknown as Promise<
              UploadApiErrorResponse | UploadApiResponse | undefined
            >
        );
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
      jest.spyOn(postQueue, 'addPostJob');

      await Create.prototype.postWithImage(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('addPost', createdPost);
      expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        createdPost: createdPost,
        currentUserId: `${req.currentUser!.userId}`,
        uId: `${req.currentUser!.uId}`
      });

      expect(postQueue.addPostJob).toHaveBeenCalledWith(ADD_POST_TO_DB, {
        key: req.currentUser?.userId,
        value: createdPost
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post Created with image Successfully'
      });
    });
  });
});
