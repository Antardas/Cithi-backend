import { Request, Response } from 'express';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { reactionData, reactionMockRequest, reactionMockResponse } from '@/root/mocks/reaction.mock';
import { ReactionCache } from '@/service/redis/reaction.cache';
import { Get } from '@/reaction/controllers/get-reaction';
import { reactionService } from '@/service/db/reaction.service';
import mongoose from 'mongoose';
import { postMockData } from '@/root/mocks/post.mock';

jest.mock('@/service/redis/base.cache');
// jest.mock('@/service/db/reaction.service');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('reactions', () => {
    it('should send correct response if reactions exist is cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, { postId: reactionData.postId }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.reactions(req, res);
      expect(ReactionCache.prototype.getReactions).toHaveBeenCalledWith(`${reactionData.postId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post Reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.reactions(req, res);
      expect(reactionService.getPostReactions).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post Reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactions').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[], 0]);

      await Get.prototype.reactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post Reactions',
        reactions: [],
        count: 0
      });
    });
  });

  describe('getSinglePostReactionByUsername', () => {
    it('should send correct response if reactions exist is cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: reactionData.postId,
        username: authUserPayload.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSinglePostReactionByUsername').mockResolvedValue([reactionData, 1]);

      await Get.prototype.getSinglePostReactionByUsername(req, res);
      expect(ReactionCache.prototype.getSinglePostReactionByUsername).toHaveBeenCalledWith(`${reactionData.postId}`, authUserPayload.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct response if reactions exist is database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: reactionData.postId,
        username: authUserPayload.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSinglePostReactionByUsername').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue([reactionData, 1]);

      await Get.prototype.getSinglePostReactionByUsername(req, res);
      expect(reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(`${reactionData.postId}`, authUserPayload.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: reactionData.postId,
        username: authUserPayload.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSinglePostReactionByUsername').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue([]);

      await Get.prototype.getSinglePostReactionByUsername(req, res);
      expect(reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(`${reactionData.postId}`, authUserPayload.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: {},
        count: 0
      });
    });
  });

  describe('getReactionsByUsername', () => {
    it('should send correct response if reactions exist', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: `${authUserPayload.username}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([reactionData]);

      await Get.prototype.getReactionsByUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All reactions by username',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: authUserPayload.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([]);

      await Get.prototype.getReactionsByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All reactions by username',
        reactions: [],
        count: 0
      });
    });
  });
});

//
